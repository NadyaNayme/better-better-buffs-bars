import useStore from "../store";

export const useBuffs = () => {
  const buffs = useStore(state => state.buffs);
  return { buffs };
};