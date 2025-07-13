import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createBuffsSlice, type BuffsSlice } from './buffsSlice';
import { createGroupsSlice, type GroupsSlice } from './groupsSlice';
import { createProfilesSlice, type ProfilesSlice } from './profilesSlice';
import { createSettingsSlice, type SettingsSlice } from './settingsSlice';
import { createUISlice, type UISlice } from './uiSlice';
import { createDebugSlice, type DebugSlice } from './debugSlice';

type StoreState = BuffsSlice & GroupsSlice & ProfilesSlice & SettingsSlice & UISlice & DebugSlice;

const useStore = create<StoreState>()(
  persist(
    (...state) => ({
      ...createBuffsSlice(...state),
      ...createGroupsSlice(...state),
      ...createProfilesSlice(...state),
      ...createSettingsSlice(...state),
      ...createUISlice(...state),
      ...createDebugSlice(...state),
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
        lastMobNameplatePos: state.lastMobNameplatePos
      }),
    }
  )
);

export default useStore;