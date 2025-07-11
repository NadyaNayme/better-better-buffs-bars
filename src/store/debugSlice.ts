import { type StateCreator } from 'zustand';
import type { DebugLogEntry } from '../types/DebugLogEntry';

export interface DebugSlice {
    debug: {
        verboseEnabled: boolean;
        debugLogs: DebugLogEntry[];
        addDebugLog: (entry: DebugLogEntry) => void;
        clearDebugLogs: () => void;
        toggleVerbose: () => void;
      };
}

export const createDebugSlice: StateCreator<
  DebugSlice,
  [],
  [],
  DebugSlice
> = (set, get) => ({
  debug: {
    verboseEnabled: true,
    debugLogs: [],
    addDebugLog: (entry) => {
      if (entry.type === 'verbose' && !get().debug.verboseEnabled) return;
      set((state) => ({
        debug: {
          ...state.debug,
          debugLogs: [...state.debug.debugLogs.slice(-299), entry],
        },
      }));
    },
    clearDebugLogs: () => {
      set((state) => ({
        debug: {
          ...state.debug,
          debugLogs: [],
        },
      }));
    },
    toggleVerbose: () => {
      set((state) => ({
        debug: {
          ...state.debug,
          verboseEnabled: !state.debug.verboseEnabled,
        },
      }));
    },
  },
});