import React, { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import useStore from '../store/index';
import BuffComponent from './BuffComponent';
import AddBuffModal from './AddBuffModal';
import EditGroupModal from './EditGroupModal';
import type { Group } from '../types/Group';
import { debugLog } from '../lib/debugLog';
import { BuffRenderer } from './BuffRenderer';

interface GroupComponentProps {
  group: Group;
  a1lib: any;
  alt1Ready: any;
  inCombat: boolean;
  combatCheck: boolean;
}

const GroupComponent: React.FC<GroupComponentProps> = ({ group, a1lib, alt1Ready, inCombat, combatCheck }) => {
  const { reorderBuffsInGroup, removeBuffFromGroup, updateGroup, cooldownColor,timeRemainingColor } = useStore();
  const [isAddBuffModalOpen, setAddBuffModalOpen] = useState(false);
  const [isEditGroupModalOpen, setEditGroupModalOpen] = useState(false);
  const [isUpdatingPosition, setIsUpdatingPosition] = useState(false);

  const updateOverlayPosition = async () => {
    if (!a1lib || !window.alt1) {
      debugLog.error('Alt1 library not detected.');
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
  
    debugLog.info(`Overlay position set to x: ${finalPos.x}, y: ${finalPos.y}`);
  };

  // useAlt1OverlayRenderer(group, {
  //   alt1Ready,
  //   a1lib,
  //   inCombat,
  //   combatCheck,
  //   cooldownColor,
  //   timeRemainingColor,
  // });

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
    <>
      {group.buffs.map(buff => (
        <BuffRenderer
          key={buff.id}
          buff={buff}
          drawIndex={buff.index + 1}
          group={group}
          alt1Ready={alt1Ready}
          a1lib={a1lib}
          inCombat={inCombat}
          combatCheck={combatCheck}
          cooldownColor={cooldownColor}
          timeRemainingColor={timeRemainingColor}
        />
      ))}
    </>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={group.buffs.map(b => b.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-12-dynamic gap-2" style={{ 
            '--buff-min-width': `${minWidth}px`,
            '--buff-rows': `${group.buffsPerRow}`
            } as React.CSSProperties}>
            {group.buffs
              .map((buff) => {
                if (buff.name === "Blank") return;
                return (
                  <BuffComponent
                    key={buff.id}
                    buff={buff}
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