import React, { useState } from 'react';
import useStore from '../store';

const AddBuffModal = ({ groupId, onClose }) => {
  const { buffs, groups, addBuffToGroup } = useStore();
  const [selectedBuff, setSelectedBuff] = useState('');

  const group = groups.find(g => g.id === groupId);
  const existingBuffIds = group ? group.buffs.map(b => b.id) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedBuff) {
      addBuffToGroup(groupId, selectedBuff);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-black p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Add Buff</h2>
        <form onSubmit={handleSubmit}>
          <select
            value={selectedBuff}
            onChange={(e) => setSelectedBuff(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          >
            <option value="" disabled>Select a buff</option>
            {buffs
              .filter(buff => !existingBuffIds.includes(buff.id))
              .map(buff => (
                <option key={buff.id} value={buff.id}>{buff.name}</option>
              ))
            }
          </select>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!selectedBuff}
            >
              Add Buff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBuffModal;