// @ts-nocheck
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import buffsData from './buffs.json';
const useStore = create(persist((set, get) => ({
    groups: [],
    profiles: [],
    activeProfile: null,
    buffs: buffsData.buffs.map(buff => ({ ...buff, id: uuidv4() })),
    version: 0,
    setVersion: (version) => set({ version }),
    setBuffsFromJsonIfNewer: () => {
        const version = get().version;
        const jsonVersion = buffsData.version;
        if (jsonVersion > version) {
            const newBuffs = buffsData.buffs.map(buff => ({
                ...buff,
                id: uuidv4(),
            }));
            set({ buffs: newBuffs, version: jsonVersion });
            console.log(`Buffs updated to version ${jsonVersion}`);
        }
    },
    // Profiles
    createProfile: (name) => {
        const newProfile = { id: uuidv4(), name, groups: get().groups };
        set((state) => ({
            profiles: [...state.profiles, newProfile],
            activeProfile: newProfile.id,
        }));
    },
    loadProfile: (id) => {
        const profile = get().profiles.find(p => p.id === id);
        if (profile) {
            set({ groups: profile.groups, activeProfile: id });
        }
    },
    saveProfile: () => {
        const { activeProfile, profiles, groups } = get();
        if (activeProfile) {
            set({
                profiles: profiles.map(p => p.id === activeProfile ? { ...p, groups } : p),
            });
        }
    },
    deleteProfile: (id) => {
        set((state) => ({
            profiles: state.profiles.filter(p => p.id !== id),
            activeProfile: state.activeProfile === id ? null : state.activeProfile,
            groups: state.activeProfile === id ? [] : state.groups,
        }));
    },
    editProfile: (id, newName) => {
        set((state) => ({
            profiles: state.profiles.map(p => p.id === id ? { ...p, name: newName } : p),
        }));
    },
    // Groups
    createGroup: (name) => {
        const newGroup = {
            id: uuidv4(),
            name,
            buffs: [],
            overlayPosition: { x: 0, y: 0 },
            bigHeadMode: false,
            bigHeadModeFirst: true,
            buffsPerRow: 8,
            scale: 100,
            explicitInactive: false,
            enabled: true,
        };
        set((state) => ({ groups: [...state.groups, newGroup] }));
    },
    deleteGroup: (id) => {
        set((state) => ({
            groups: state.groups.filter(g => g.id !== id),
        }));
    },
    updateGroup: (id, updates) => {
        set((state) => ({
            groups: state.groups.map(g => g.id === id ? { ...g, ...updates } : g),
        }));
    },
    // Buffs
    addBuffToGroup: (groupId, buffId) => {
        const buff = get().buffs.find(b => b.id === buffId);
        if (buff) {
            set(state => ({
                groups: state.groups.map(g => g.id === groupId ? { ...g, buffs: [...g.buffs, buff] } : g)
            }));
        }
    },
    removeBuffFromGroup: (groupId, buffId) => {
        set(state => ({
            groups: state.groups.map(g => g.id === groupId ? { ...g, buffs: g.buffs.filter(b => b.id !== buffId) } : g)
        }));
    },
    reorderBuffsInGroup: (groupId, oldIndex, newIndex) => {
        set(state => {
            const group = state.groups.find(g => g.id === groupId);
            if (group) {
                const newBuffs = Array.from(group.buffs);
                const [removed] = newBuffs.splice(oldIndex, 1);
                newBuffs.splice(newIndex, 0, removed);
                return {
                    groups: state.groups.map(g => g.id === groupId ? { ...g, buffs: newBuffs } : g)
                };
            }
            return state;
        });
    },
    updateBuffByName: (name, timeRemaining) => {
        set((state) => ({
          groups: state.groups.map(group => ({
            ...group,
            buffs: group.buffs.map(buffInGroup => {
              if (buffInGroup.name === name) {
                return {
                  ...buffInGroup,
                  timeRemaining: timeRemaining,
                  isActive: timeRemaining > 0,
                };
              }
              return buffInGroup;
            }),
          })),
        }));
      },
    setAllBuffsInactive: () => {
        set((state) => ({
          groups: state.groups.map(group => ({
            ...group,
            buffs: group.buffs.map(buff => ({
              ...buff,
              isActive: false,
              timeRemaining: 0,
            })),
          })),
        }));
      },
}), {
    name: 'buff-tracker-storage',
}));
export default useStore;
