import { type StateCreator } from 'zustand';
import a1lib from 'alt1';
import { toast } from 'sonner';
import type { Store } from '../types/Store';
import { debugStrings } from '../data/debugStrings';

export interface UISlice {
  debugMode: boolean;
  inCombat: boolean;
  cooldownColor: { r: number; g: number; b: number };
  timeRemainingColor: { r: number; g: number; b: number };
  lastMobNameplatePos: a1lib.PointLike | null;
  targetReaderStatus: string;
  setDebugMode: (enabled: boolean) => void;
  setInCombat: (value: boolean) => void;
  setCooldownColor: (color: { r: number; g: number; b: number }) => void;
  setTimeRemainingColor: (color: { r: number; g: number; b: number }) => void;
  setLastMobNameplatePos: (pos: a1lib.PointLike | null) => void;
  setTargetReaderStatus: (status: string) => void;
}

export const createUISlice: StateCreator<Store, [], [], UISlice> = (set, get) => ({
  debugMode: false,
  inCombat: false,
  cooldownColor: { r: 255, g: 255, b: 0 },
  timeRemainingColor: { r: 255, g: 255, b: 255 },
  lastMobNameplatePos: null,
  targetReaderStatus: 'IDLE',
  setDebugMode: (enabled) => {
    if (enabled === true) toast.success(debugStrings[Math.floor(Math.random() * debugStrings.length)]);
    if (enabled !== get().debugMode) set({ debugMode: enabled });
  },
  setInCombat: (value) => {
    if (value !== get().inCombat) set({ inCombat: value });
  },
  setCooldownColor: (color) => set({ cooldownColor: color }),
  setTimeRemainingColor: (color) => set({ timeRemainingColor: color }),
  setLastMobNameplatePos: (pos) => set({ lastMobNameplatePos: pos }),
  setTargetReaderStatus: (status) => set({ targetReaderStatus: status }),
});