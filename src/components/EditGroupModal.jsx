import React, { useState } from 'react';
import useStore from '../store';

const EditGroupModal = ({ group, onClose }) => {
  const { updateGroup, deleteGroup } = useStore();
  const [name, setName] = useState(group.name);
  const [bigHeadMode, setBigHeadMode] = useState(group.bigHeadMode);
  const [bigHeadModeFirst, setBigHeadModeFirst] = useState(group.bigHeadModeFirst);
  const [enabled, setEnabled] = useState(group.enabled);

  const handleSave = () => {
    updateGroup(group.id, { name, bigHeadMode, bigHeadModeFirst, enabled });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      deleteGroup(group.id);
      onClose();
    }
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
              type="checkbox"
              checked={bigHeadMode}
              onChange={(e) => setBigHeadMode(e.target.checked)}
              className="mr-2"
            />
            <label>Enable Big Head Mode</label>
          </div>
          {bigHeadMode && (
            <div>
              <label className="block mb-1">Big Head Position</label>
              <select
                value={bigHeadModeFirst ? 'first' : 'last'}
                onChange={(e) => setBigHeadModeFirst(e.target.value === 'first')}
                className="w-full p-2 border border-gray-300 rounded text-red"
              >
                <option value="first">First Buff</option>
                <option value="last">Last Buff</option>
              </select>
            </div>
          )}
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
          <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Delete Group
          </button>
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