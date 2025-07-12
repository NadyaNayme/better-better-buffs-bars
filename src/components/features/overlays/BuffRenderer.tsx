import { useEffect } from 'react';
import type { Buff } from '../../../types/Buff';
import type { Group } from '../../../types/Group';
import type { Color } from '../../../types/Color';
import { formatTime } from '../../../lib/formatTime';
import { debugLog } from '../../../lib/debugLog';

interface BuffRendererProps {
  buff: Buff;
  group: Group;
  a1lib: any;
  alt1Ready: boolean;
  inCombat: boolean;
  combatCheck: boolean;
  drawIndex: number;
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
  cooldownColor,
  timeRemainingColor,
  drawIndex
}: BuffRendererProps) {
  
    useEffect(() => {
        if (!alt1Ready || !window.alt1) return;
        if (!drawIndex) return;    

        // --- Calculate Position ---
        const x = group.overlayPosition?.x ?? 15;
        const y = group.overlayPosition?.y ?? 15;
        const baseSize = 27 * (group.scale / 100);
        const spacing = baseSize + 1;
        const cols = group.buffsPerRow || 8;
        const col = drawIndex % cols;
        const row = Math.floor(drawIndex / cols);
        const drawX = Math.floor(x + col * spacing);
        const drawY = Math.floor(y + row * spacing);

        if (!drawX || !drawY) {
            debugLog.error(`No overlay position exists for this buff's group.`)
        }
    
        // --- Draw Image ---
        const imageGroupId = `region-${group.id}-${buff.id}`;
        const textGroupId = `${group.id}-${buff.id}-text`;
        const isOnCooldown = (buff.cooldownRemaining ?? 0) > 0;
        const useInactive = isOnCooldown || (group.explicitInactive && !buff.isActive);

        // --- Clear overlay if not in combat ---
        if (!inCombat && combatCheck) {
            window.alt1.overLayClearGroup(imageGroupId);
            window.alt1.overLayRefreshGroup(imageGroupId);
            window.alt1.overLayClearGroup(textGroupId);
            window.alt1.overLayRefreshGroup(textGroupId);
        }
        
        // Choose the correct image data
        let imgData: string | null | undefined = useInactive
          ? buff.scaledDesaturatedImageData || buff.desaturatedImageData
          : buff.scaledImageData || buff.imageData;
          
        // Handle Meta buff image override
        if (buff.isActive && buff.buffType === 'Meta' && buff.foundChild) {
          imgData = buff.foundChild.scaledImageData ?? buff.foundChild.imageData;
        }
    
        if (imgData) {
          window.alt1.overLaySetGroup(imageGroupId);
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
            window.alt1.overLayImage(drawX, drawY, encoded, img.width, 3000);
            window.alt1.overLayRefreshGroup(imageGroupId);
          };
          img.src = imgData;
        }
        debugLog.verbose(`Redrew ${buff.name}}`, buff)
        
        // --- Draw Text ---
        const displayTime = isOnCooldown ? buff.cooldownRemaining : buff.timeRemaining;
        const shouldDrawText = !buff.noNumberDisplay && displayTime && displayTime > 0;
    
        window.alt1.overLaySetGroup(textGroupId);
        window.alt1.overLayClearGroup(textGroupId);
    
        if (shouldDrawText) {
          const textColor = a1lib.mixColor(
            isOnCooldown ? cooldownColor.r : timeRemainingColor.r,
            isOnCooldown ? cooldownColor.g : timeRemainingColor.g,
            isOnCooldown ? cooldownColor.b : timeRemainingColor.b
          );
          const text = formatTime(Number(displayTime));
          window.alt1.overLaySetGroupZIndex(textGroupId, 3);
          window.alt1.overLayTextEx(
            text, textColor, Math.floor(10 * (group.scale / 100)),
            Math.floor(drawX + ((group.scale / 100) * (19 - text.length))),
            Math.floor(drawY + ((group.scale / 100) * 19)),
            100, '', true, true
          );
        }
        window.alt1.overLayRefreshGroup(textGroupId);
    
        return () => {
        };
      }, [
        alt1Ready, a1lib, buff, group, drawIndex, 
        cooldownColor, timeRemainingColor
      ]);
    
      return null;
    }