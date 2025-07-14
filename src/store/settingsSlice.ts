import { type StateCreator } from 'zustand';
import type { Store } from '../types/Store';

export interface SettingsSlice {
  enableAlerts: boolean;
  alertVolume: number;
  combatCheck: boolean;
  setEnableAlerts: (enabled: boolean) => void;
  setAlertVolume: (volume: number) => void;
  setEnableCombatCheck: (enabled: boolean) => void;
}

export const createSettingsSlice: StateCreator<Store, [], [], SettingsSlice> = (set, get) => ({
  enableAlerts: true,
  alertVolume: 100,
  combatCheck: true,
  setEnableAlerts: (enabled) => {
    if (enabled === get().enableAlerts) return;
    set({ enableAlerts: enabled });
  },
  setAlertVolume: (volume) => {
    if (volume === get().alertVolume) return;
    set({ alertVolume: volume });
  },
  setEnableCombatCheck: (enabled) => {
    if (enabled === get().combatCheck) return;
    set({ combatCheck: enabled });
  },
});