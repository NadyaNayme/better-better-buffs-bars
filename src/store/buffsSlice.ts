import { type StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { BUFFS_VERSION, buffsData } from '../data/buffs';
import { isRuntimeBuff, type Buff, type BuffInstance } from '../types/Buff';
import { type Store } from '../types/Store';
import { debugLog } from '../lib/debugLog';

export interface BuffsSlice {
  buffs: Buff[];
  version: number;
  setVersion: (version: number) => void;
  setBuffsFromJsonIfNewer: () => void;
  getBuffThresholds: (buffName: string) => { pass: number; fail: number };
  customThresholds: Record<string, { pass: number; fail: number }>;
  setCustomThreshold: (
    buffName: string,
    thresholds: { pass: number; fail: number }
  ) => void;
  removeCustomThreshold: (buffName: string) => void;
}

export const createBuffsSlice: StateCreator<
  Store,
  [],
  [],
  BuffsSlice
> = (set, get) => ({
  buffs: buffsData.map((buff: Buff) => ({ ...buff, id: uuidv4(), index: -1, groupId: '' })),
  version: 1,
  setVersion: (version) => set({ version }),
  customThresholds: {},

  setBuffsFromJsonIfNewer: () => {
    const version = get().version;
    const jsonVersion = BUFFS_VERSION;
  
    if (jsonVersion > version) {
      const newBuffs = buffsData.map((buff: Buff) => ({
        ...buff,
        id: uuidv4(),
        index: -1,
        groupId: '',
        status: "Inactive",
        statusChangedAt: null,
        timeRemaining: 0,
        cooldownStart: null,
        activeChild: null,
        foundChild: null,
        hasAlerted: false,
      }));
  
      const buffMap = new Map(newBuffs.map((buff) => [buff.name, buff]));
  
      set((state) => {
        const updatedGroups = state.groups.map((group) => {
          const updatedBuffs = group.buffs.map((buff) => {
            const updated = buffMap.get(buff.name);
            return updated
              ? {
                  ...updated,
                  id: buff.id,
                  index: buff.index,
                  groupId: group.id,
                }
              : buff;
          });
  
          return { ...group, buffs: updatedBuffs };
        });
  
        return {
          buffs: newBuffs,
          groups: updatedGroups,
          version: jsonVersion,
        };
      });
  
      debugLog.info(`Buffs updated to version ${jsonVersion}`);
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
    if (!baseBuff || !baseBuff.thresholds) return {
        pass: 300,
        fail: 100
    };
    return {
        pass: custom?.pass ?? baseBuff.thresholds.pass ?? 10,
        fail: custom?.fail ?? baseBuff.thresholds.fail ?? 50,
    };
  },
});