import { type StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import buffsData from '../buffs.json';
import { type Buff } from '../types/Buff';
import { type Store } from '../types/Store';

export interface BuffsSlice {
  buffs: Buff[];
  version: number;
  setVersion: (version: number) => void;
  setBuffsFromJsonIfNewer: () => void;
  getBuffThresholds: (buffName: string) => { passThreshold: number; failThreshold: number };
  customThresholds: Record<string, { passThreshold: number; failThreshold: number }>;
  setCustomThreshold: (
    buffName: string,
    thresholds: { passThreshold: number; failThreshold: number }
  ) => void;
  removeCustomThreshold: (buffName: string) => void;
}

export const createBuffsSlice: StateCreator<
  Store,
  [],
  [],
  BuffsSlice
> = (set, get) => ({
  buffs: buffsData.buffs.map((buff) => ({ ...buff, id: uuidv4() })),
  version: 1,
  setVersion: (version) => set({ version }),
  customThresholds: {},

  setBuffsFromJsonIfNewer: () => {
    const version = get().version;
    const jsonVersion = buffsData.version;

    if (jsonVersion > version) {
      const newBuffs = buffsData.buffs.map((buff) => ({
        ...buff,
        id: uuidv4(),
      }));
      set({ buffs: newBuffs, version: jsonVersion });
      console.log(`Buffs updated to version ${jsonVersion}`);
    }
  },

  setCustomThreshold: (buffName, thresholds) =>
    set((state) => ({
      customThresholds: {
        ...state.customThresholds,
        [buffName]: thresholds,
      },
    })),

  removeCustomThreshold: (buffName) => {
    set((state) => {
      const updated = { ...state.customThresholds };
      delete updated[buffName];
      return { customThresholds: updated };
    });
  },

  getBuffThresholds: (buffName) => {
    const custom = get().customThresholds?.[buffName];
    const baseBuff = get().buffs.find((b) => b.name === buffName);
    return {
      passThreshold: custom?.passThreshold ?? baseBuff?.passThreshold ?? 10,
      failThreshold: custom?.failThreshold ?? baseBuff?.failThreshold ?? 50,
    };
  },
});