import { useEffect, useRef } from "react";
import { formatTime } from "../lib/formatTime";
import { debugLog } from "../lib/debugLog";
import type { Buff } from "../types/Buff";
import type { Group } from "../types/Group";

interface UseAlt1OverlayRendererForBuffOptions {
    alt1Ready: boolean;
    a1lib: any;
    group: Group;
    cooldownColor: { r: number; g: number; b: number };
    timeRemainingColor: { r: number; g: number; b: number };
}

export function useAlt1OverlayRendererForBuff(
    buff: Buff,
    {
        alt1Ready,
        a1lib,
        group,
        cooldownColor,
        timeRemainingColor,
    }: UseAlt1OverlayRendererForBuffOptions
) {
    const prevBuffRef = useRef<Buff | null>(null);

    useEffect(() => {
        if (!alt1Ready || !a1lib || !window.alt1) return;
        if (!buff.index && buff.index !== 0) {
            debugLog.error(`Buff ${buff.name} missing index, skipping render.`);
            return;
        }

        // Compare relevant fields - skip if no changes
        const prev = prevBuffRef.current;
        if (
            prev &&
            prev.isActive === buff.isActive &&
            prev.timeRemaining === buff.timeRemaining &&
            prev.cooldownRemaining === buff.cooldownRemaining
        ) {
            return; // No changes, skip render
        }
        prevBuffRef.current = buff;

        const region = group.id;
        const x = group.overlayPosition?.x ?? 15;
        const y = group.overlayPosition?.y ?? 15;
        const baseSize = 27 * (group.scale / 100);
        const spacing = baseSize + 1;
        const cols = group.buffsPerRow || 8;

        const col = buff.index % cols;
        const row = Math.floor(buff.index / cols);
        const drawX = x + col * spacing;
        const drawY = y + row * spacing;

        // Clear old overlay for this buff
        const textId = `${region}-${buff.name}-text`;
        window.alt1.overLaySetGroup(textId);
        window.alt1.overLayFreezeGroup(textId);
        window.alt1.overLayClearGroup(textId);

        // Draw cooldown/time text if needed
        if (!buff.noNumberDisplay) {
            const isOnCooldown = (buff.cooldownRemaining ?? 0) > 0;
            const displayTime = isOnCooldown ? buff.cooldownRemaining : buff.timeRemaining;
            const textColor = a1lib.mixColor(
                isOnCooldown ? cooldownColor.r : timeRemainingColor.r,
                isOnCooldown ? cooldownColor.g : timeRemainingColor.g,
                isOnCooldown ? cooldownColor.b : timeRemainingColor.b
            );
            const text = formatTime(Number(displayTime ?? 0));

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
        }
        window.alt1.overLayRefreshGroup(textId);

        // Draw image
        window.alt1.overLaySetGroup(`region${region}`);
        window.alt1.overLayFreezeGroup(`region${region}`);

        const isOnCooldown = (buff.cooldownRemaining ?? 0) > 0;
        const useInactive = isOnCooldown || (group.explicitInactive && !buff.isActive);
        const imgData = useInactive
            ? buff.scaledDesaturatedImageData || buff.desaturatedImageData
            : buff.scaledImageData || buff.imageData;

        if (!imgData) return;

        const base64 = imgData.replace(/^data:image\/png;base64,/, "");
        if (!base64) return;

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
        img.onerror = () => {
            console.error(`Failed to load image for buff ${buff.name}`);
        };

        img.src = imgData;

    }, [
        alt1Ready,
        a1lib,
        buff.isActive,
        buff.timeRemaining,
        buff.cooldownRemaining,
        buff.noNumberDisplay,
        buff.index,
        buff.scaledDesaturatedImageData,
        buff.desaturatedImageData,
        buff.scaledImageData,
        buff.imageData,
        group.id,
        group.overlayPosition?.x,
        group.overlayPosition?.y,
        group.scale,
        group.buffsPerRow,
        group.explicitInactive,
        cooldownColor.r,
        cooldownColor.g,
        cooldownColor.b,
        timeRemainingColor.r,
        timeRemainingColor.g,
        timeRemainingColor.b,
    ]);
}