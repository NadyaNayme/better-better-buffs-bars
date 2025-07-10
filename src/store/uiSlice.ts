import { type StateCreator } from 'zustand';
import a1lib from 'alt1';
import { toast } from 'sonner';
import type { Store } from '../types/Store';

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

const debugStrings = [
    "You have entered the matrix.",
    "You are now behind the scenes.",
    "Be careful poking around here...",
    "4|23 `/0(_) 4 1337 |-|4><0|2?",
    "01000100 01100101 01100010 01110101 01100111 00100000 01001101 01101111 01100100 01100101 00100000 01000101 01101110 01100001 01100010 01101100 01100101 01100100",
    "Welcome to Debug Mode: where the bugs are the features.",
    "Ah, Debug Mode. Also known as \"guess and check\" mode.",
    "Debug Mode activated. Please refrain from screaming at the monitor.",
    "Enabling Debug Mode... okay, now which of these console logs is lying to me?",
    "Debug Mode: because \"it works on my machine\" wasn't nihilistic enough.",
    "Congratulations! Your Debugging level is now 79! Or was it 97?",
    "Welcome to Debug Mode. Blame Nyu that you're here.",
  ]

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