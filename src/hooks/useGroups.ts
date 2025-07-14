import useStore from '../store/index';

export const useGroups = () => {
  const groups = useStore(state => state.groups);
  const createGroup = useStore(state => state.createGroup);
  const deleteGroup = useStore(state => state.deleteGroup);
  const updateGroup = useStore(state => state.updateGroup);

  return { groups, createGroup, deleteGroup, updateGroup };
};