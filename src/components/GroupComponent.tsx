import React, { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import useStore from '../store';
import Buff from './Buff';
import AddBuffModal from './AddBuffModal';
import EditGroupModal from './EditGroupModal';
import type { Group } from '../types/Group';

interface GroupComponentProps {
  group: Group;
  a1lib: any;
  alt1Ready: any;
  inCombat: boolean;
  combatCheck: boolean;
}

const GroupComponent: React.FC<GroupComponentProps> = ({ group, a1lib, alt1Ready, inCombat, combatCheck }) => {
  const { cooldownColor, timeRemainingColor } = useStore();
  const { reorderBuffsInGroup, removeBuffFromGroup, updateGroup } = useStore();
  const [isAddBuffModalOpen, setAddBuffModalOpen] = useState(false);
  const [isEditGroupModalOpen, setEditGroupModalOpen] = useState(false);
  const [isUpdatingPosition, setIsUpdatingPosition] = useState(false);

  const updateOverlayPosition = async () => {
    if (!a1lib || !window.alt1) {
      console.log('Alt1 library not detected.');
      return;
    }
  
    setIsUpdatingPosition(true);
    window.alt1.setTooltip("Press Alt+1 (or Alt1's main hotkey if rebound) to save position");
  
    let alt1Pressed = false;
    const alt1Listener = () => {
      alt1Pressed = true;
    };
    a1lib.once('alt1pressed', alt1Listener);
  
    while (!alt1Pressed) {
      const pos = a1lib.getMousePosition() ?? undefined;
  
      if (pos !== undefined && pos.x !== undefined && pos.y !== undefined) {
        updateGroup(group.id, { overlayPosition: { x: pos.x, y: pos.y } });
      }
      await new Promise(r => setTimeout(r, 20));
    }
  
    window.alt1.clearTooltip();
    setIsUpdatingPosition(false);
  
    const finalPos = a1lib.getMousePosition();
    updateGroup(group.id, { overlayPosition: { x: finalPos.x, y: finalPos.y } });
  
    console.log(`Overlay position set to x: ${finalPos.x}, y: ${finalPos.y}`);
  };

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m` : `${secs}`;
  };

  useEffect(() => {
    if (!alt1Ready || !a1lib || !window.alt1) return;
    if (!group.enabled || !inCombat && combatCheck) {
      window.alt1.overLayClearGroup(`region${group.id}`);
      window.alt1.overLayRefreshGroup(`region${group.id}`);
      group.buffs.forEach(buff => {
        window.alt1.overLayClearGroup(`${group.id}-${buff.name}-text`);
        window.alt1.overLayRefreshGroup(`${group.id}-${buff.name}-text`);
      });
      return;
    }
  
    const overlayPosition = group.overlayPosition;
    const x = overlayPosition?.x ?? 15;
    const y = overlayPosition?.y ?? 15;
  
    const region = group.id;
    const baseSize = 27 * (group.scale / 100);
    const spacing = baseSize + 1;
    const cols = group.buffsPerRow || 8;

    group.buffs.map((buff) => {
      if (!buff.isActive && !group.explicitInactive && !(buff.noNumberDisplay)) {
        window.alt1.overLayClearGroup(`${region}-${buff.name}-text`);
        window.alt1.overLayRefreshGroup(`${region}-${buff.name}-text`);
      }
    })

    const buffsToDraw = group.buffs.filter(buff => {
      if (buff.noNumberDisplay || group.explicitInactive) {
        return true;
      }
      const isOnCooldown = (buff.cooldownRemaining ?? 0) > 0;
      return buff.isActive || isOnCooldown || buff.isStack;
    });

    window.alt1.overLaySetGroup(`region${region}`);
    window.alt1.overLayFreezeGroup(`region${region}`);
    window.alt1.overLayClearGroup(`region${region}`);

    buffsToDraw.forEach((buff, index) => {
      const isOnCooldown = (buff.cooldownRemaining ?? 0) > 0;
      const col = index % cols;
      const row = Math.floor(index / cols);
      const drawX = x + col * spacing;
      const drawY = y + row * spacing;
    
      window.alt1.overLaySetGroup(`${region}-${buff.name}-text`);
      window.alt1.overLayFreezeGroup(`${region}-${buff.name}-text`);

      window.alt1.overLayClearGroup(`${region}-${buff.name}-text`);
      window.alt1.overLaySetGroupZIndex(`${region}-${buff.name}-text`, 3);

      // If the buff is a stack and it has no stacks clear the text
      if (buff.isStack && buff.timeRemaining === 0) {
        window.alt1.overLaySetGroup(`${region}-${buff.name}-text`);
        window.alt1.overLayFreezeGroup(`${region}-${buff.name}-text`);
        window.alt1.overLayClearGroup(`${region}-${buff.name}-text`);
        return;
      }

      const timeToDisplay = isOnCooldown ? buff.cooldownRemaining : (buff.timeRemaining ?? '');
      const textColor = isOnCooldown
        ? a1lib.mixColor(cooldownColor.r, cooldownColor.g, cooldownColor.b)
        : a1lib.mixColor(timeRemainingColor.r, timeRemainingColor.g, timeRemainingColor.b);

      if (buff.noNumberDisplay) {
        return;
      }

      let formattedTime = formatTime(Number(timeToDisplay));

      window.alt1.overLayTextEx(
        formattedTime,
        textColor,
        Math.floor(10 * (group.scale / 100)),
        Math.floor(drawX + ((group.scale / 100) * (19 - formattedTime.length))),
        Math.floor(drawY + ((group.scale / 100) * 19)),
        100,
        '',
        true,                     
        true
      );
      window.alt1.overLayRefreshGroup(`${region}-${buff.name}-text`);
    });

  
    window.alt1.overLaySetGroup(`region${region}`);
    window.alt1.overLayFreezeGroup(`region${region}`);
    window.alt1.overLayClearGroup(`region${region}`);

    let loadedCount = 0;
    const imagesToLoad = group.buffs.length;

    const checkAndRefresh = () => {
      if (loadedCount === imagesToLoad) {
        window.alt1.overLayRefreshGroup(`region${region}`);
      }
    };
  
    buffsToDraw.forEach((buff, index) => {

      if (buff.buffType === "Meta" && !buff.imageData) {
        loadedCount++;
        checkAndRefresh();
        return;
      }

      const img = new Image();
      const isOnCooldown = (buff.cooldownRemaining ?? 0) > 0;
      const useDesaturatedImage = isOnCooldown || (group.explicitInactive && !buff.isActive);
      const activeImageData = buff.scaledImageData || buff.imageData;
      const inactiveImageData = buff.scaledDesaturatedImageData || buff.desaturatedImageData;
      const imageDataBase64 = useDesaturatedImage ? inactiveImageData : activeImageData;

      const rawBase64 = imageDataBase64?.replace(/^data:image\/png;base64,/, '');

      if (!rawBase64) {
        loadedCount++;
        checkAndRefresh();
        return;
      }
  
      const col = index % cols;
      const row = Math.floor(index / cols);
      const drawX = x + col * spacing;
      const drawY = y + row * spacing;
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx === null) return;
        ctx.drawImage(img, 0, 0);
  
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const encoded = a1lib.encodeImageString(imageData);
  
        window.alt1.overLayImage(Math.floor(drawX), Math.floor(drawY), encoded, img.width, 1200);
        
        loadedCount++;
        checkAndRefresh();
      };

      img.onerror = () => {
        console.error(`Failed to load image for buff: ${buff.name}`);
        loadedCount++;
        checkAndRefresh();
      };
  
      img.src = imageDataBase64;
    });

    const globalBuffs = useStore.getState().buffs;
    const blankBuff = globalBuffs.find(b => b.name === "Blank");
    
    if (blankBuff?.imageData || blankBuff?.scaledImageData) {
      const img = new Image();
      const imageDataBase64 = blankBuff.scaledImageData ?? blankBuff.imageData;
      const rawBase64 = imageDataBase64?.replace(/^data:image\/png;base64,/, '');
    
      if (rawBase64) {
        const index = buffsToDraw.length;
        const col = index % cols;
        const row = Math.floor(index / cols);
        const drawX = x + col * spacing;
        const drawY = y + row * spacing;
    
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx === null) return;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const encoded = a1lib.encodeImageString(imageData);
    
          window.alt1.overLayImage(Math.floor(drawX), Math.floor(drawY), encoded, img.width, 1200);
          window.alt1.overLayRefreshGroup(`region${region}`);
        };
    
        img.src = imageDataBase64;
      }
    }

  }, [alt1Ready, a1lib, inCombat, combatCheck, group.id, group.enabled, group.overlayPosition, group.scale, group.buffsPerRow, group.buffs]);

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = group.buffs.findIndex((b) => b.id === active.id);
      const newIndex = group.buffs.findIndex((b) => b.id === over.id);
      reorderBuffsInGroup(group.id, oldIndex, newIndex);
    }
  };

  const handleRemoveBuff = (buffId: string) => {
    removeBuffFromGroup(group.id, buffId);
  };

  const minWidth = 27;

  return (
    <div className={`border-2 border-gray-600 rounded-lg p-4 ${!group.enabled && !isEditGroupModalOpen ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{group.name} {group.enabled ? '' : ' - Disabled'}</h3>
        <div className="flex gap-2">
          {alt1Ready && (
            <button
            onClick={updateOverlayPosition}
            disabled={isUpdatingPosition}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isUpdatingPosition ? 'Updating Position...' : 'Update Overlay Position'}
          </button>
          )}
          <button onClick={() => setAddBuffModalOpen(true)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Add Buff
          </button>
          <button onClick={() => setEditGroupModalOpen(true)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            Settings
          </button>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={group.buffs.map(b => b.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-12-dynamic gap-2" style={{ 
            '--buff-min-width': `${minWidth}px`,
            '--buff-rows': `${group.buffsPerRow}`
            } as React.CSSProperties}>
            {group.buffs
              .map((buff, index, filteredBuffs) => {
                const isInactive = !buff.isActive;
                if (buff.name === "Blank") return;
                return (
                  <Buff
                    key={buff.id}
                    buff={buff}
                    scale={group.scale}
                    desaturated={group.explicitInactive && isInactive}
                    onRemove={() => handleRemoveBuff(buff.id)}
                  />
                );
              })}
          </div>
        </SortableContext>
      </DndContext>

      {isAddBuffModalOpen && <AddBuffModal groupId={group.id} onClose={() => setAddBuffModalOpen(false)} />}
      {isEditGroupModalOpen && <EditGroupModal group={group} onClose={() => setEditGroupModalOpen(false)} />}
    </div>
  );
};

export default GroupComponent;