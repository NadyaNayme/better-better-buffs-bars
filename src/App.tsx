import React from 'react';
import useStore from './store';
import Group from './components/Group';
import ProfileManager from './components/ProfileManager';

function App() {
  const { groups, createGroup } = useStore();

  const handleCreateGroup = () => {
    const groupName = prompt('Enter group name:');
    if (groupName) {
      createGroup(groupName);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">Better Buffs Bar</h1>
      </header>

      <ProfileManager />

      <div className="mb-8">
        <button onClick={handleCreateGroup} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Create New Group
        </button>
      </div>

      <div className="space-y-8">
        {groups.map(group => (
          <Group key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}

export default App;