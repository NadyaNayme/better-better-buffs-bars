import React, { useState, useMemo } from 'react';
import useStore from '../store';

interface AddBuffModalComponentProps {
  groupId: string;
  onClose: () => void;
}

const AddBuffModal: React.FC<AddBuffModalComponentProps> = ({ groupId, onClose }) => {
  const { buffs, addBuffToGroup } = useStore();
  const currentGroup = useStore(state => 
    state.groups.find(g => g.id === groupId)
  );
  const [selectedBuff, setSelectedBuff] = useState('');

  const existingBuffIds = useMemo(() => {
    if (!currentGroup) return new Set();
    return new Set(currentGroup.buffs
      .filter(buff => !buff.isUtility)
      .map(b => b.id));
  }, [currentGroup]);

  const handleSubmit = (e: any) => {
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
            {buffs.map(buff => {
              if (buff.isUtility) return;
              const isAlreadyInGroup = existingBuffIds.has(buff.id);
              return (
                <option
                  key={buff.id}
                  value={buff.id}
                  disabled={isAlreadyInGroup}
                  className={isAlreadyInGroup ? 'text-gray-500' : ''}
                >
                  {buff.name} {isAlreadyInGroup && '(Already in group)'}
                </option>
              );
            })}
          </select>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Add Buff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBuffModal;