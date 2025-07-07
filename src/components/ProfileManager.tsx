import React, { useState } from 'react';
import useStore from '../store';
import type { Profile } from '../types/Profile';

type ProfileManagerProps = {
  openModalForProfile: () => void;
};

const ProfileManager: React.FC<ProfileManagerProps> = ({ openModalForProfile }) => {
  const {
    profiles,
    activeProfile,
    createProfile,
    loadProfile,
    deleteProfile,
    editProfile,
  } = useStore();
  const [newProfileName, setNewProfileName] = useState('');
  const [editingProfile, setEditingProfile] = useState('');
  const [editingProfileName, setEditingProfileName] = useState('');

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      createProfile(newProfileName);
      setNewProfileName('');
    }
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile.id);
    setEditingProfileName(profile.name);
  };

  const handleSaveEdit = () => {
    if (editingProfileName.trim()) {
      editProfile(editingProfile ?? '', editingProfileName);
      setEditingProfile('');
      setEditingProfileName('');
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg mb-4">
      <h2 className="text-xl font-bold mb-4">Profiles</h2>
      <div className="flex gap-4 mb-4">
        <button onClick={openModalForProfile} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create New Profile
        </button>
        <button onClick={handleSaveEdit} disabled={!activeProfile} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
          Update Loaded Profile
        </button>
      </div>

      {profiles.length > 0 ? (
        <div className="flex flex-col gap-4">
          <label htmlFor="profile-select" className="font-bold">Load Profile:</label>
          <select
            id="profile-select"
            value={activeProfile || ''}
            onChange={(e) => loadProfile(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
          >
            <option value="" disabled>Select a profile</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex flex-col items-end gap-2">
            {profiles.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                {editingProfile === p.id ? (
                  <>
                    <input
                      type="text"
                      value={editingProfileName}
                      onChange={(e) => setEditingProfileName(e.target.value)}
                      className="p-2 rounded bg-gray-700 text-white"
                    />
                    <button onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded">
                      Save
                    </button>
                    <button onClick={() => setEditingProfile('')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                  <span className="mr-2">{p.name}</span>
                    <button onClick={() => handleEdit(p)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">
                      Edit
                    </button>
                    <button onClick={() => deleteProfile(p.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No profiles created yet. Name and save a profile to get started.</p>
      )}
    </div>
  );
};

export default ProfileManager;