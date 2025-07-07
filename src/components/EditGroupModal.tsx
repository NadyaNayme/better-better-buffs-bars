import React, { useState } from 'react';
import useStore from '../store';
import ConfirmModal from './ConfirmModal';
import type { Group } from '../types/Group';

interface EditGroupModalComponentProps {
  group: Group;
  onClose: () => void;
}

const EditGroupModal: React.FC<EditGroupModalComponentProps> = ({ group, onClose }) => {
  if (!group) return null; 

  const { updateGroup, deleteGroup } = useStore();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [name, setName] = useState(group.name);
  const [buffsPerRow, setBuffsPerRow] = useState(group.buffsPerRow);
  const [explicitInactive, setExplicitInactive] = useState(group.explicitInactive ?? false);
  const [scale, setScale] = useState(group.scale || 100);
  const [enabled, setEnabled] = useState(group.enabled);

  const handleSave = () => {
    updateGroup(group.id, { name, buffsPerRow: Number(buffsPerRow), explicitInactive, scale: Number(scale), enabled });
    onClose();
  };

  const handleDelete = () => {
    deleteGroup(group.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-black p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Group</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              max="50"
              value={buffsPerRow}
              onChange={(e) => setBuffsPerRow(Number(e.target.value))}
              className="mr-2"
            />
            <label>Buffs Per Row</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={explicitInactive}
              onChange={(e) => setExplicitInactive(e.target.checked)}
              className="mr-2"
            />
            <label>Show Inactive Buffs (Desaturated)</label>
          </div>
          <div className="flex items-center">
            <label className="block mb-1">Scale: {scale}%</label>
            <input
              type="range"
              min="50"
              max="500"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="mr-2"
            />
            <label>Enable Group</label>
          </div>
        </div>
        <div className="flex justify-between mt-8 gap-4">
          <button
          onClick={() => setDeleteModalOpen(true)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Delete Group
        </button>

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Group"
          message="Are you sure you want to delete this group? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
          <div className="flex gap-4">
            <button onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
            <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGroupModal;