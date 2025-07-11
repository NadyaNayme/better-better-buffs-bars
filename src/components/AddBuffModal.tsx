import React, { useState, useMemo } from 'react';
import useStore from '../store';

interface AddBuffModalComponentProps {
  groupId: string;
  onClose: () => void;
}

const AddBuffModal: React.FC<AddBuffModalComponentProps> = ({ groupId, onClose }) => {
  const { buffs, addBuffToGroup, removeBuffFromGroup } = useStore();
  const currentGroup = useStore(state =>
    state.groups.find(g => g.id === groupId)
  );

  const [categoryFilter, setCategoryFilter] = useState<'All' | string>('All');

  if (!currentGroup) return null;

  const isBuffInGroup = (buffId: string) =>
    currentGroup.buffs.some(b => b.id === buffId);

  const handleToggleBuff = (buffId: string) => {
    if (isBuffInGroup(buffId)) {
      removeBuffFromGroup(groupId, buffId);
    } else {
      addBuffToGroup(groupId, buffId);
    }
  };

  const allCategories = useMemo(() => {
    const catSet = new Set<string>();
    buffs.forEach(buff => {
      if (buff.isUtility) return;
      buff.categories?.forEach(cat => catSet.add(cat));
    });
    return Array.from(catSet).sort();
  }, [buffs]);

  const categorizedBuffs = useMemo(() => {
    const map = new Map<string, typeof buffs>();
    buffs.forEach(buff => {
      if (buff.isUtility || !buff.categories) return;
      for (const category of buff.categories) {
        if (categoryFilter !== 'All' && category !== categoryFilter) continue;
        if (!map.has(category)) map.set(category, []);
        map.get(category)!.push(buff);
      }
    });
    return map;
  }, [buffs, categoryFilter]);

  const allSortedBuffs = useMemo(() => {
    if (categoryFilter !== 'All') return [];
  
    const seen = new Set<string>();
    const list: { buff: typeof buffs[number]; category: string }[] = [];
  
    for (const buff of buffs) {
      if (buff.isUtility || seen.has(buff.id)) continue;
      const firstCategory = buff.categories?.[0];
      if (!firstCategory) continue;
  
      seen.add(buff.id);
      list.push({ buff, category: firstCategory });
    }
  
    return list.sort((a, b) => {
      const catComp = a.category.localeCompare(b.category);
      if (catComp !== 0) return catComp;
      return a.buff.name.localeCompare(b.buff.name);
    });
  }, [buffs, categoryFilter]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#364554] p-6 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white text-md font-bold">Select Buffs</h4>
          <p>Click a buff to start tracking it for this group. <br/>Click it again to stop tracking it.</p>
        </div>

        <div className="mb-6">
          <label className="text-white font-semibold mr-2">Filter by Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded text-white"
          >
            <option value="All">All</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {categoryFilter === 'All' ? (
          <div className="buff-grid grid gap-1">
            {allSortedBuffs.map(({ buff }) => {
              const inGroup = isBuffInGroup(buff.id);
              return (
                <img
                  key={buff.id}
                  src={buff.imageData}
                  alt={buff.name}
                  title={buff.name}
                  onClick={() => handleToggleBuff(buff.id)}
                  className={`cursor-pointer transition-opacity duration-200 rounded hover:opacity-80 ${
                    inGroup ? 'opacity-100' : 'opacity-30'
                  }`}
                  style={{ width: 27, height: 27 }}
                />
              );
            })}
          </div>
        ) : (
          [...categorizedBuffs.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, buffs]) => (
              <div key={category} className="mb-6">
                <h3 className="text-white text-md font-semibold mb-2">{category}</h3>
                <div className="buff-grid grid gap-1">
                  {buffs.map(buff => {
                    const inGroup = isBuffInGroup(buff.id);
                    return (
                      <img
                        key={`${category}-${buff.id}`}
                        src={buff.imageData}
                        alt={buff.name}
                        title={buff.name}
                        onClick={() => handleToggleBuff(buff.id)}
                        className={`cursor-pointer transition-opacity duration-200 rounded hover:opacity-80 ${
                          inGroup ? 'opacity-100' : 'opacity-30'
                        }`}
                        style={{ width: 27, height: 27 }}
                      />
                    );
                  })}
                </div>
              </div>
            ))
        )}

        <div className="flex justify-start mt-6">
          <p>Some buffs have been temporarily disabled from being added to new groups while I attempt to fix a flickering issue they cause. If you have these buffs tracking in a group and are experiencing issues it is recommended that you remove them.</p>
          <ul>
            <li>Conjure Undead Army</li>
            <li>Death Spark</li>
            <li>DPS Prayers</li>
            <li>Overhead Prayers</li>
            <li>Quiver (all 3 variants)</li>
          </ul>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn v1 px-6 py-2 rounded"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBuffModal;