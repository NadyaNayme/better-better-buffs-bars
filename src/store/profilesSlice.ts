import { type StateCreator } from 'zustand';
import { type Group } from '../types/Group';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import type { Store } from '../types/Store';

export interface ProfilesSlice {
  profiles: { id: string; name: string; groups: Group[] }[];
  activeProfile: string | null;
  createProfile: (name: string) => void;
  loadProfile: (id: string) => void;
  saveProfile: (id: string) => Promise<void>;
  deleteProfile: (id: string) => void;
  editProfile: (id: string, newName: string) => void;
}

export const createProfilesSlice: StateCreator<Store, [], [], ProfilesSlice> = (set, get) => ({
  profiles: [],
  activeProfile: null,
  createProfile: (name) => {
    const state = get();
    const newProfile = { id: uuidv4(), name, groups: state.groups };
    set((state) => ({
      profiles: [...state.profiles, newProfile],
      activeProfile: newProfile.id,
    }));
  },
  loadProfile: (id) => {
    const profile = get().profiles.find((p) => p.id === id);
    if (profile) {
      set({ groups: profile.groups, activeProfile: id });
      toast.success(`${profile.name} Loaded`);
    }
  },
  saveProfile: async () => {
    const { activeProfile, profiles, groups } = get();
    if (activeProfile) {
      set({
        profiles: profiles.map((p) => (p.id === activeProfile ? { ...p, groups } : p)),
      });
    }
  },
  deleteProfile: (id) => {
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== id),
      activeProfile: state.activeProfile === id ? null : state.activeProfile,
      groups: state.activeProfile === id ? [] : state.groups,
    }));
    toast.info(`Profile Deleted`);
  },
  editProfile: (id, newName) => {
    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === id ? { ...p, name: newName } : p)),
    }));
  },
});
