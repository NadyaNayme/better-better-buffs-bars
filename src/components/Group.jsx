import React, { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import useStore from '../store';
import Buff from './Buff';
import AddBuffModal from './AddBuffModal';
import EditGroupModal from './EditGroupModal';

const Group = ({ group }) => {
  const { reorderBuffsInGroup, removeBuffFromGroup } = useStore();
  const [isAddBuffModalOpen, setAddBuffModalOpen] = useState(false);
  const [isEditGroupModalOpen, setEditGroupModalOpen] = useState(false);

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

  return (
    <div className={`border-2 border-gray-600 rounded-lg p-4 ${!group.enabled && !isEditGroupModalOpen ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{group.name} {group.enabled ? '' : ' - Disabled'}</h2>
        <div className="flex gap-2">
          <button onClick={() => alert('Placeholder for Change Position')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Change Position
          </button>
          <button onClick={() => setAddBuffModalOpen(true)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Add Buff
          </button>
          <button onClick={() => setEditGroupModalOpen(true)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            Edit
          </button>
        </div>
      </div>

      <DndContext sensors={[]} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={group.buffs.map(b => b.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-8 gap-2">
            {group.buffs.map((buff, index) => {
              const isBigHead = group.bigHeadMode && ((group.bigHeadModeFirst && index === 0) || (!group.bigHeadModeFirst && index === group.buffs.length - 1));
              return <Buff key={buff.id} buff={buff} isBigHead={isBigHead} onRemove={() => handleRemoveBuff(buff.id)} />;
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