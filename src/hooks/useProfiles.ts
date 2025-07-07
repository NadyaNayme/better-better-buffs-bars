import useStore from '../store';

export const useProfiles = () => {
  const profiles = useStore(state => state.groups);
  const createProfile = useStore(state => state.createProfile);
  const deleteProfile = useStore(state => state.deleteProfile);
  const editProfile = useStore(state => state.editProfile);

  return { profiles, createProfile, deleteProfile, editProfile };
};