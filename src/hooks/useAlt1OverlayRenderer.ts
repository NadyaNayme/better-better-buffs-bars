import { useEffect } from "react";
import useStore from "../store/index";
import { formatTime } from "../lib/formatTime";
import { type Group } from "../types/Group";

interface UseAlt1OverlayRendererOptions {
  alt1Ready: boolean;
  a1lib: any;
  inCombat: boolean;
  combatCheck: boolean;
  cooldownColor: { r: number; g: number; b: number };
  timeRemainingColor: { r: number; g: number; b: number };
}

export function useAlt1OverlayRenderer(
  group: Group,
  {
    alt1Ready,
    a1lib,
    inCombat,
    combatCheck,
    cooldownColor,
    timeRemainingColor,
  }: UseAlt1OverlayRendererOptions
) {
  useEffect(() => {
    if (!alt1Ready || !a1lib || !window.alt1) return;

    const region = group.id;
    const x = group.overlayPosition?.x ?? 15;
    const y = group.overlayPosition?.y ?? 15;
    const baseSize = 27 * (group.scale / 100);
    const spacing = baseSize + 1;
    const cols = group.buffsPerRow || 8;

    // --- Clear overlays if disabled or out of combat ---
    if (!group.enabled || (!inCombat && combatCheck)) {
      window.alt1.overLayClearGroup(`region${region}`);
      window.alt1.overLayRefreshGroup(`region${region}`);
      group.buffs.forEach((buff) => {
        const groupId = `${region}-${buff.name}-text`;
        window.alt1.overLayClearGroup(groupId);
        window.alt1.overLayRefreshGroup(groupId);
      });
      return;
    }

    // --- Filter buffs to draw ---
    const buffsToDraw = group.buffs.filter((buff) => {
      if (buff.noNumberDisplay || group.explicitInactive) return true;
      const isOnCooldown = (buff.cooldownRemaining ?? 0) > 0;
      return buff.isActive || isOnCooldown;
    });

    // --- Draw numbers (time remaining / cooldown) ---
    buffsToDraw.forEach((buff, index) => {
      const isOnCooldown = (buff.cooldownRemaining ?? 0) > 0;
      const col = index % cols;
      const row = Math.floor(index / cols);
      const drawX = x + col * spacing;
      const drawY = y + row * spacing;
      const textId = `${region}-${buff.name}-text`;

      if (buff.noNumberDisplay) return;

      const displayTime = isOnCooldown ? buff.cooldownRemaining : buff.timeRemaining;
      const textColor = a1lib.mixColor(
        isOnCooldown ? cooldownColor.r : timeRemainingColor.r,
        isOnCooldown ? cooldownColor.g : timeRemainingColor.g,
        isOnCooldown ? cooldownColor.b : timeRemainingColor.b
      );
      const text = formatTime(Number(displayTime ?? 0));

      window.alt1.overLaySetGroup(textId);
      window.alt1.overLayFreezeGroup(textId);
      window.alt1.overLayClearGroup(textId);
      window.alt1.overLaySetGroupZIndex(textId, 3);

      window.alt1.overLayTextEx(
        text,
        textColor,
        Math.floor(10 * (group.scale / 100)),
        Math.floor(drawX + ((group.scale / 100) * (19 - text.length))),
        Math.floor(drawY + ((group.scale / 100) * 19)),
        100,
        '',
        true,
        true
      );

      window.alt1.overLayRefreshGroup(textId);
    });

    // --- Draw images ---
    window.alt1.overLaySetGroup(`region${region}`);
    window.alt1.overLayFreezeGroup(`region${region}`);
    window.alt1.overLayClearGroup(`region${region}`);

    let loadedCount = 0;
    const imagesToLoad = buffsToDraw.length;

    const checkAndRefresh = () => {
      if (loadedCount === imagesToLoad) {
        window.alt1.overLayRefreshGroup(`region${region}`);
      }
    };

    buffsToDraw.forEach((buff, index) => {
      const isOnCooldown = (buff.cooldownRemaining ?? 0) > 0;
      const useInactive = isOnCooldown || (group.explicitInactive && !buff.isActive);
      const imgData = useInactive
        ? buff.scaledDesaturatedImageData || buff.desaturatedImageData
        : buff.scaledImageData || buff.imageData;

      if (!imgData) {
        loadedCount++;
        checkAndRefresh();
        return;
      }

      const base64 = imgData.replace(/^data:image\/png;base64,/, "");
      if (!base64) {
        loadedCount++;
        checkAndRefresh();
        return;
      }

      const col = index % cols;
      const row = Math.floor(index / cols);
      const drawX = x + col * spacing;
      const drawY = y + row * spacing;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const encoded = a1lib.encodeImageString(imageData);

        window.alt1.overLayImage(Math.floor(drawX), Math.floor(drawY), encoded, img.width, 1200);

        loadedCount++;
        checkAndRefresh();
      };

      img.onerror = () => {
        console.error(`Failed to load image for buff ${buff.name}`);
        loadedCount++;
        checkAndRefresh();
      };

      img.src = imgData;
    });

    // --- Optional blank slot drawing ---
    const globalBuffs = useStore.getState().buffs;
    const blank = globalBuffs.find((b) => b.name === "Blank");
    const blankImg = blank?.scaledImageData || blank?.imageData;

    if (blankImg) {
      const index = buffsToDraw.length;
      const col = index % cols;
      const row = Math.floor(index / cols);
      const drawX = x + col * spacing;
      const drawY = y + row * spacing;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const encoded = a1lib.encodeImageString(imageData);

        window.alt1.overLayImage(Math.floor(drawX), Math.floor(drawY), encoded, img.width, 1200);
        window.alt1.overLayRefreshGroup(`region${region}`);
      };
      img.src = blankImg;
    }
  }, [
    alt1Ready,
    a1lib,
    group,
    inCombat,
    combatCheck,
    group.enabled,
    group.overlayPosition,
    group.scale,
    group.buffsPerRow,
    group.buffs,
  ]);
}