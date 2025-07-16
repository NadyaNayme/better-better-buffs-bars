import { useEffect } from 'react';
import { isRuntimeBuff, type BuffInstance } from '../../../types/Buff';
import type { Group } from '../../../types/Group';
import type { Color } from '../../../types/Color';
import { formatTime } from '../../../lib/formatTime';
import { debugLog } from '../../../lib/debugLog';
import { useGlobalClock } from '../../../hooks/useGlobalClock';

interface BuffRendererProps {
  buff: BuffInstance;
  group: Group;
  a1lib: A1Lib;
  alt1Ready: boolean;
  inCombat: boolean;
  combatCheck: boolean;
  drawIndex: number;
  isUpdatingPosition: boolean;
  cooldownColor: Color;
  timeRemainingColor: Color;
}

export function BuffRenderer({
  buff,
  group,
  a1lib,
  alt1Ready,
  inCombat,
  combatCheck,
  isUpdatingPosition,
  cooldownColor,
  timeRemainingColor,
  drawIndex
}: BuffRendererProps) {
  const globalTick = useGlobalClock();

    const cooldownRemaining = (buff.cooldownStart && typeof buff.cooldown === 'number')
    ? Math.max(0, buff.cooldown - Math.floor((Date.now() - buff.cooldownStart) / 1000))
    : 0;
    const isStackBuff = buff.type === "StackBuff";
    const isOnCooldown = buff.status === "OnCooldown";
    let useInactive = isOnCooldown || (group.explicitInactive && buff.status !== "Active");
    if (isStackBuff && typeof buff.stacks === 'number' && buff.stacks) useInactive = buff.stacks === 0;
  
    useEffect(() => {
        if (!alt1Ready || !window.alt1) {
          debugLog.error(`Alt1 is not ready or does not exist.`)
          return;
        }
        if (drawIndex === null) {
          debugLog.error(`Cannot draw buff - it is missing a drawIndex. ${group.name} -> ${buff.name}`)
          return
        };    

        const imageGroupId = `region-${group.id}-${buff.id}`;
        const textGroupId = `${group.id}-${buff.id}-text`;

        const cleanup = () => {
          if (window.alt1) {
            window.alt1.overLayClearGroup(imageGroupId);
            window.alt1.overLayRefreshGroup(imageGroupId);
            window.alt1.overLayClearGroup(textGroupId);
            window.alt1.overLayRefreshGroup(textGroupId);
          }
        };

        if (!group.explicitInactive && buff.status === "Inactive" || !group.enabled) {
          cleanup();
          return;
        }

        const allBuffs = group.buffs; // or group.children, depending on which you're rendering

        // Count how many lower-indexed buffs are Inactive and should be skipped from drawing
        const skippedBefore = allBuffs.filter(
          (b) =>
            isRuntimeBuff(b) &&
            b.index < buff.index &&
            b.status === 'Inactive' &&
            !group.explicitInactive // Only skipped if not explicitly showing them
        ).length;
        
        const effectiveDrawIndex = drawIndex - skippedBefore;

        // --- Calculate Position ---
        const x = group.overlayPosition?.x ?? 15;
        const y = group.overlayPosition?.y ?? 15;
        const baseSize = 27 * (group.scale / 100);
        const spacing = baseSize + 1;
        const cols = group.buffsPerRow || 8;
        const col = effectiveDrawIndex % cols;
        const row = Math.floor(effectiveDrawIndex / cols);
        const drawX = Math.floor(x + col * spacing);
        const drawY = Math.floor(y + row * spacing);

        if (!drawX || !drawY) {
            debugLog.error(`No overlay position exists for this buff's group.`)
        }
    
        // --- Draw Image ---

        // --- Clear overlay if not in combat ---
        if (!inCombat && combatCheck) {
            cleanup();
            return;
        }
        
        // Choose the correct image data
        let imgData: string | null | undefined = useInactive
          ? buff.scaledDesaturatedImageData || buff.desaturatedImageData
          : buff.scaledImageData || buff.imageData;

          if (buff.type === 'MetaBuff' && buff.foundChild) {
            debugLog.verbose(`MetaBuff ${buff.name} foundChild: ${JSON.stringify(buff.foundChild)}`);
          }

          if (!imgData || typeof imgData !== 'string') {
            debugLog.error(`Missing or invalid image data for buff: ${buff.name} (meta child: ${buff.foundChild?.name})`);
            return;
          }
          
        // Handle Meta buff image override
        if (buff.status === "Active" && buff.type === 'MetaBuff' && buff.foundChild) {
          const newImgData = buff.foundChild.imageData;
          if (imgData !== newImgData) {
            debugLog.verbose(`Image changed for ${buff.name}.`);
            imgData = newImgData;
          }
        }else if (buff.type === 'MetaBuff' && buff.status === "Inactive") {
          imgData = buff.scaledImageData ?? buff.defaultImageData;
        }
    
        if (imgData) {
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
            window.alt1.overLaySetGroup(imageGroupId);
            window.alt1.overLayFreezeGroup(imageGroupId);
            window.alt1.overLayClearGroup(imageGroupId);
            window.alt1.overLayImage(drawX, drawY, encoded, img.width, 5000);
            window.alt1.overLayRefreshGroup(imageGroupId);
          };
          img.onerror = () => {
            debugLog.error(`Failed to load image for buff: ${buff.name} | imgData: ${imgData?.slice(0, 30)}...`);
          };
          img.src = imgData;
        }
        if (buff.name !== "Blank") debugLog.verbose(`Redrew ${buff.name} | ${buff.timeRemaining ? buff.timeRemaining : buff.stacks} | ${buff.status}`)
        
        // --- Draw Text ---
        let displayTime = isOnCooldown ? cooldownRemaining : buff.timeRemaining;
        if (isStackBuff && buff.stacks) {
          displayTime = buff.stacks; 
          console.log(`Display Time`, displayTime);
        }
        let shouldDrawText = buff.hasText && displayTime && displayTime > 0;
        if (isStackBuff && buff.stacks) {
          shouldDrawText = buff.stacks > 0;
          console.log(`Should draw text: `, shouldDrawText);
        }
    
        if (shouldDrawText) {
          const textColor = a1lib.mixColor(
            isOnCooldown ? cooldownColor.r : timeRemainingColor.r,
            isOnCooldown ? cooldownColor.g : timeRemainingColor.g,
            isOnCooldown ? cooldownColor.b : timeRemainingColor.b
          );
          const text = formatTime(Number(displayTime));
          window.alt1.overLaySetGroup(textGroupId);
          window.alt1.overLayClearGroup(textGroupId);
          window.alt1.overLayFreezeGroup(textGroupId);
          window.alt1.overLaySetGroupZIndex(textGroupId, 3);
          window.alt1.overLayTextEx(
            text, textColor, Math.floor(10 * (group.scale / 100)),
            Math.floor(drawX + ((group.scale / 100) * (19 - text.length))),
            Math.floor(drawY + ((group.scale / 100) * 19)),
            5000, '', true, true
          );
          window.alt1.overLayRefreshGroup(textGroupId);
        } else {
          if (buff.name !== "Blank") debugLog.verbose(`Not drawing text for ${buff.name}. Time Remaining: ${buff.timeRemaining} / Cooldown: ${buff.cooldownStart}`);
          window.alt1.overLaySetGroup(textGroupId);
          window.alt1.overLayClearGroup(textGroupId);
          window.alt1.overLayRefreshGroup(textGroupId);
        }
    
        return () => {};
      }, [
        alt1Ready, a1lib, buff.name, buff.status, buff.timeRemaining, buff.stacks,
  buff.activeChild, group.id, drawIndex, inCombat, cooldownColor, timeRemainingColor, isUpdatingPosition, cooldownRemaining, globalTick 
      ]);
    
      return null;
    }