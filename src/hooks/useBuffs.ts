import useStore from "../store/index";

export const useBuffs = () => {
  const buffs = useStore(state => state.buffs);
  return { buffs };
};