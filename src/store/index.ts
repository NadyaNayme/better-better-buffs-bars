import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { migrateOldStorageIfNeeded } from '../lib/dataMigration';
import type { StoreState } from '../types/Store';
import { createBuffsSlice } from './buffsSlice';
import { createGroupsSlice } from './groupsSlice';
import { createProfilesSlice } from './profilesSlice';
import { createSettingsSlice } from './settingsSlice';
import { createUISlice } from './uiSlice';
import { createAlertsSlice } from './alertSlice';
import { createDebugSlice } from './debugSlice';
import { createCombatSlice } from './combatSlice';

migrateOldStorageIfNeeded();
const useStore = create<StoreState>()(
  persist(
    (...state) => ({
      ...createBuffsSlice(...state),
      ...createGroupsSlice(...state),
      ...createProfilesSlice(...state),
      ...createSettingsSlice(...state),
      ...createUISlice(...state),
      ...createAlertsSlice(...state),
      ...createDebugSlice(...state),
      ...createCombatSlice(...state),
    }),
    {
      name: 'better-buffs-bars-storage',
      partialize: (state) => ({
        groups: state.groups,
        profiles: state.profiles,
        activeProfile: state.activeProfile,
        buffs: state.buffs,
        version: state.version,
        cooldownColor: state.cooldownColor,
        timeRemainingColor: state.timeRemainingColor,
        customThresholds: state.customThresholds,
        enableAlerts: state.enableAlerts,
        alertVolume: state.alertVolume,
        debugMode: state.debugMode,
        combatCheck: state.combatCheck,
        lastMobNameplatePos: state.lastMobNameplatePos,
        alertEnabledMap: state.alertEnabledMap,
        voice: state.voice,
      }),
    }
  )
);

export default useStore;