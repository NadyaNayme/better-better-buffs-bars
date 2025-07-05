// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import useStore from '../store';
import Buff from './Buff';
import AddBuffModal from './AddBuffModal';
import EditGroupModal from './EditGroupModal';

const imageCache = new Map<string, HTMLCanvasElement>();

const Group = ({ group, a1lib, alt1Ready  }) => {
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
    window.alt1.setTooltip('Press Alt+1 to save position');
  
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
    if (!group.enabled) {
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
      if (!buff.isActive && !group.explicitInactive && !(buff.buffType === "Meta")) {
        window.alt1.overLayClearGroup(`${region}-${buff.name}-text`);
        window.alt1.overLayRefreshGroup(`${region}-${buff.name}-text`);
      }
    })

    const buffsToDraw = group.buffs.filter(buff => {
      if (buff.buffType === "Meta" || group.explicitInactive) {
        return true;
      }
      const isOnCooldown = (buff.cooldownRemaining ?? 0) > 0;
      return buff.isActive || isOnCooldown;
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

      const timeToDisplay = isOnCooldown ? buff.cooldownRemaining : (buff.timeRemaining ?? '');
      const textColor = isOnCooldown
        ? a1lib.mixColor(cooldownColor.r, cooldownColor.g, cooldownColor.b)
        : a1lib.mixColor(timeRemainingColor.r, timeRemainingColor.g, timeRemainingColor.b);
      // These buffs do not have time or stacks
      if (buff.name === "Overhead Prayers" || buff.name === "DPS Prayers" || buff.name === "Quiver" || buff.name === "Death Spark") {
        return;
      }

      let formattedTime = formatTime(timeToDisplay);

      if (buff.buffType === "Meta") {
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
      } else {
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
      }
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
      let activeImageData = buff.scaledImageData || buff.imageData;
      if (buff.buffType === 'Meta' && buff.foundChild) {
        activeImageData = buff.foundChild.scaledImageData || buff.imageData;
      }
      let inactiveImageData = buff.scaledDesaturatedImageData || buff.desaturatedImageData;
      if (buff.buffType === 'Meta' && buff.foundChild) {
        activeImageData = buff.foundChild.scaledDesaturatedImageData || buff.foundChild.desaturatedImageData;
      }
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
  }, [alt1Ready, a1lib, group.id, group.enabled, group.overlayPosition, group.scale, group.buffsPerRow, group.buffs]);

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = group.buffs.findIndex((b) => b.id === active.id);
      const newIndex = group.buffs.findIndex((b) => b.id === over.id);
      reorderBuffsInGroup(group.id, oldIndex, newIndex);
    }
  };

  const handleRemoveBuff = (buffId) => {
    removeBuffFromGroup(group.id, buffId);
  };

  const scale = group.scale ?? 100;
  const minWidth = 27;

  return (
    <div className={`border-2 border-gray-600 rounded-lg p-4 ${!group.enabled && !isEditGroupModalOpen ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{group.name} {group.enabled ? '' : ' - Disabled'}</h2>
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
            Edit
          </button>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={group.buffs.map(b => b.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-12-dynamic gap-2" style={{ 
            '--buff-min-width': `${minWidth}px`,
            '--buff-rows': `${group.buffsPerRow}`
            }}>
            {group.buffs
              .map((buff, index, filteredBuffs) => {
                const isInactive = !buff.isActive;

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

export default Group;