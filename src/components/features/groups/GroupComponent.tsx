import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import useStore from '../../../store/index';
import BuffComponent from '../buffs/BuffComponent';
import AddBuffModal from '../buffs/AddBuffModal';
import EditGroupModal from './EditGroupModal';
import type { Group } from '../../../types/Group';
import { debugLog } from '../../../lib/debugLog';
import { BuffRenderer } from '../overlays/BuffRenderer';
import { isRuntimeBuff } from '../../../types/Buff';

interface GroupComponentProps {
  group: Group;
  a1lib: any;
  alt1Ready: any;
  inCombat: boolean;
  combatCheck: boolean;
  activeBuff: any;
  dragOverGroupId: string | null;
}

const GroupComponent: React.FC<GroupComponentProps> = ({ group, a1lib, alt1Ready, inCombat, combatCheck, activeBuff, dragOverGroupId }) => {
  const { removeBuffFromGroup, updateGroup, cooldownColor,timeRemainingColor } = useStore();
  const [isAddBuffModalOpen, setAddBuffModalOpen] = useState(false);
  const [isEditGroupModalOpen, setEditGroupModalOpen] = useState(false);
  const [isUpdatingPosition, setIsUpdatingPosition] = useState(false);

  const updateOverlayPosition = async () => {
    if (!a1lib || !window.alt1) {
      debugLog.error('Alt1 library not detected.');
      return;
    }
  
    setIsUpdatingPosition(true);
  
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
    setIsUpdatingPosition(false);
  
    const finalPos = a1lib.getMousePosition();
    updateGroup(group.id, { overlayPosition: { x: finalPos.x, y: finalPos.y } });
  
    debugLog.info(`Overlay position set to x: ${finalPos.x}, y: ${finalPos.y}`);
  };

  const handleRemoveBuff = (buffId: string) => {
    removeBuffFromGroup(group.id, buffId);
  };

  const minWidth = 27;

  const visibleBuffs = group.buffs.filter(
    (b) => isRuntimeBuff(b) && b.name !== "Blank"
  );
  
  const placeholderId = `drop-placeholder-${group.id}`;
  const sortableItems = visibleBuffs.length > 0
  ? visibleBuffs.map(buff => buff.id)
  : [placeholderId];

  const { setNodeRef } = useDroppable({
    id: placeholderId,
  });

  const isDragOver = dragOverGroupId === group.id;

  return (
    <div className={`border-2 border-gray-600 rounded-lg p-4 ${!group.enabled && !isEditGroupModalOpen ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">
          {group.name} {group.enabled ? '' : ' - Disabled'}
        </h3>
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
  
      {isUpdatingPosition && (
        <p className="mb-4 text-sm text-white/80">
          Press Alt+1 (or Alt1{"'"}s main hotkey if rebound) to save position
        </p>
      )}
  
      {group.buffs.map(buff => {
        if (!isRuntimeBuff(buff)) {
          debugLog.error(`Cannot draw buff - it is missing runtime properties. ${group.name} -> ${buff.name}`);
          return null;
        }
  
        return (
          <BuffRenderer
            key={buff.id}
            buff={buff}
            drawIndex={buff.index}
            group={group}
            alt1Ready={alt1Ready}
            a1lib={a1lib}
            inCombat={inCombat}
            combatCheck={combatCheck}
            cooldownColor={cooldownColor}
            isUpdatingPosition={isUpdatingPosition}
            timeRemainingColor={timeRemainingColor}
          />
        );
      })}
  
        <SortableContext
          items={sortableItems}
          strategy={rectSortingStrategy}
        >
          <div
            className="grid grid-cols-12-dynamic gap-2"
            style={
              {
                '--buff-min-width': `${minWidth}px`,
                '--buff-rows': `${group.buffsPerRow}`,
              } as React.CSSProperties
            }
          >
          {visibleBuffs.length > 0 ? (
            visibleBuffs.map(buff => (
              <BuffComponent
                key={buff.id}
                buff={buff}
                onRemove={() => handleRemoveBuff(buff.id)}
              />
            ))
          ) : (            
            (visibleBuffs.length === 0 || isDragOver) && (
              <div
                ref={setNodeRef}
                key={`drop-placeholder-${group.id}`}
                id={`drop-placeholder-${group.id}`}
                className={`col-span-full flex items-center justify-center min-h-[60px] border border-dashed border-white/30 rounded text-sm text-white/60 text-center px-4 py-2
                  ${isDragOver ? "bg-white/20" : ""}
                `}
                style={{ gridColumn: '1 / -1' }}
              >
                {isDragOver ? "Drop buff here" : "Add a buff or drag from another group"}
              </div>
            )
          )}
          </div>
        </SortableContext>
  
      {isAddBuffModalOpen && (
        <AddBuffModal groupId={group.id} onClose={() => setAddBuffModalOpen(false)} />
      )}
      {isEditGroupModalOpen && (
        <EditGroupModal group={group} onClose={() => setEditGroupModalOpen(false)} />
      )}
    </div>
  );
};

export default GroupComponent;