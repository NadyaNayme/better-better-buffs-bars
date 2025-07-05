// @ts-nocheck
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import buffsData from './buffs.json';

interface Buff {
  id: string;
  name: string;
  failThreshold?: number;
  passThreshold?: number;
  imageData: string;
  scaledImageData?: string;
  desaturatedImageData: string;
  scaledDesaturatedImageData?: string;
  defaultImageData?: string;
  duration?: number;
  cooldown?: number;
  cooldownRemaining?: number;
  timeRemaining?: number;
  isPermanent?: boolean;
  hasAlert?: boolean;
  buffType?: string;
  isActive: boolean;
  alwaysActive?: boolean;
  lastUpdated?: Date;
  inactiveCount?: number;
}

interface Group {
  id: string;
  name:string;
  buffs: Buff[];
  buffsPerRow: number;
  enabled: boolean;
  explicitInactive: boolean;
  overlayPosition: {x: number, y: number};
  scale: number;
}

interface Profile {
  id: string;
  name: string;
  groups: Group[];
}

interface IdentifiedBuffInfo {
  name: string;
  time: number;
  foundChild?: { name: string; image: string };
}

interface StoreStateAndActions {
  groups: Group[];
  profiles: Profile[];
  activeProfile: string | null;
  buffs: Buff[];
  version: number;
  setVersion: (version: number) => void;
  setBuffsFromJsonIfNewer: () => void;
  syncIdentifiedBuffs: (foundBuffsMap: Map<string, any>) => void;
  tickTimers: () => void;
  createProfile: (name: string) => void;
  loadProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  editProfile: (id: string, newName: string) => void;
  createGroup: (name: string) => void;
  deleteGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  addBuffToGroup: (groupId: string, buffId: string) => void;
  rescaleAllGroupsOnLoad: () => void;
  removeBuffFromGroup: (groupId: string, buffId: string) => void;
  reorderBuffsInGroup: (groupid: string, oldIndex: number, newIndex: number) => void;
}

function resizedataURL(dataUrl, scale) {
    return new Promise((resolve, reject) => {
      const img = new Image();
  
      img.onload = () => {
        const baseSize = 27;
        const width = Math.floor(baseSize * scale);
        const height = Math.floor(baseSize * scale);
  
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
  
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Canvas context could not be created."));
  
        ctx.drawImage(img, 0, 0, width, height);
  
        const scaledDataUrl = canvas.toDataURL('image/png'); // data URI
        resolve({ scaledDataUrl, width, height });
      };
  
      img.onerror = (err) => reject(err);
      img.src = dataUrl;
    });
  }

const useStore = create(
  persist(
    (set, get) => ({
      groups: [],
      profiles: [],
      activeProfile: null,
      buffs: buffsData.buffs.map(buff => ({ ...buff, id: uuidv4() })),
      version: 1,
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
      syncIdentifiedBuffs: (identifiedActiveBuffs) => {
        set((state) => {
          let didChange = false;
          const now = Date.now();
      
          const updatedGroups = state.groups.map(group => {
            const updatedBuffs = group.buffs.map(buff => {
              const activeInfo = identifiedActiveBuffs.get(buff.name);
      
              if (buff.buffType === "Meta") {
                // Case 1: An active child WAS found on this tick.
                if (activeInfo && activeInfo.foundChild) {
                  didChange = true;
                  return {
                    ...buff,
                    isActive: true,
                    timeRemaining: activeInfo.time,
                    imageData: activeInfo.foundChild.imageData,
                    desaturatedImageData: activeInfo.foundChild.desaturatedImageData,
                    scaledImageData: '',
                    scaledDesaturatedImageData: '',
                    inactiveCount: 0,
                    lastUpdated: now,
                  };
                }
                
                // Case 2: No active child was found on this tick.
                else {
                  if (buff.isActive) {
                    const timeSinceLastUpdate = now - (buff.lastUpdated ?? 0);
                    if (timeSinceLastUpdate > 400) {
                      const newInactiveCount = (buff.inactiveCount ?? 0) + 1;
                      if (newInactiveCount >= 3) {
                        console.log(`Buff is inactive after 1.2s ${buff.inactiveCount}`);
                        didChange = true;
                        return {
                          ...buff,
                          isActive: false,
                          timeRemaining: 0,
                          inactiveCount: 0,
                          imageData: buff.defaultImageData,
                          lastUpdated: now,
                        };
                      } 
                      else {
                        console.log(`Buff's inactive count will be incrementing: ${buff.inactiveCount}`);
                        didChange = true;
                        return {
                          ...buff,
                          isActive: true,
                          inactiveCount: newInactiveCount,
                          lastUpdated: now,
                        };
                      }
                    }
                  return buff;
                  }
                }
              }
      
              if (activeInfo) {
                if (
                  !buff.isActive ||
                  buff.timeRemaining !== activeInfo.time
                ) {
                  didChange = true;
                  return {
                    ...buff,
                    isActive: true,
                    timeRemaining: activeInfo.time,
                    cooldownRemaining: 0,
                    lastUpdated: now,
                  };
                }
                return buff;
              }
      
              // If buff is active but not detected, decay timeRemaining based on elapsed time:
              if (buff.isActive) {
                const elapsedMs = now - (buff.lastUpdated ?? now);
                const elapsedSeconds = Math.floor(elapsedMs / 1000);
      
                if (elapsedSeconds > 0) {
                  const timeLeft = buff.timeRemaining ?? 0;
                  const newTime = Math.max(0, timeLeft - elapsedSeconds);
      
                  if (newTime === 0) {
                    didChange = true;
                    return {
                      ...buff,
                      isActive: false,
                      timeRemaining: 0,
                      cooldownRemaining: buff.cooldown ?? 0,
                      lastUpdated: now,
                    };
                  } else if (newTime !== timeLeft && timeLeft < 60) {
                    didChange = true;
                    return {
                      ...buff,
                      timeRemaining: newTime,
                      isActive: newTime > 0 || !!buff.alwaysActive,
                      lastUpdated: now,
                    };
                  }
                }
              }
      
              return buff;
            });
      
            return didChange ? { ...group, buffs: updatedBuffs } : group;
          });
      
          return didChange ? { groups: updatedGroups } : {};
        });
      },
      tickCooldownTimers: () => {
        const now = Date.now();
        set((state) => ({
          groups: state.groups.map(group => ({
            ...group,
            buffs: group.buffs.map(buff => {
              const recentlyUpdated = now - (buff.lastUpdated ?? 0) < 500;
              if (recentlyUpdated) return buff;
              if (buff.cooldownRemaining && buff.cooldownRemaining > 0 && buff.cooldownRemaining < 60) {
                 return {
                  ...buff,
                  cooldownRemaining: buff.cooldownRemaining - 1,
                };
              }
              return buff;
            })
          }))
        }));
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
            profiles: profiles.map(p =>
              p.id === activeProfile ? { ...p, groups } : p
            ),
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
          profiles: state.profiles.map(p =>
            p.id === id ? { ...p, name: newName } : p
          ),
        }));
      },

      // Groups
      createGroup: (name) => {
        const newGroup = {
          id: uuidv4(),
          name,
          buffs: [],
          overlayPosition: { x: 0, y: 0 },
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
      updateGroup: async (id, updates) => {
        set((state) => ({
          groups: state.groups.map(g => (g.id === id ? { ...g, ...updates } : g)),
        }));
        if (updates.scale !== undefined) {
          const groupToProcess = get().groups.find(g => g.id === id);
          if (!groupToProcess) return;

          const newScaleDecimal = updates.scale / 100.0;

          const resizePromises = groupToProcess.buffs.map(async (buff) => {
            const scaledPromise = buff.imageData
              ? resizedataURL(buff.imageData, newScaleDecimal)
              : Promise.resolve(null);
              
            const desaturatedPromise = buff.desaturatedImageData
              ? resizedataURL(buff.desaturatedImageData, newScaleDecimal)
              : Promise.resolve(null);

            const [scaledResult, desaturatedResult] = await Promise.all([scaledPromise, desaturatedPromise]);

            return {
              ...buff,
              scaledImageData: scaledResult?.scaledDataUrl,
              scaledDesaturatedImageData: desaturatedResult?.scaledDataUrl,
            };
          });

          const resizedBuffs = await Promise.all(resizePromises);

          set((state) => ({
            groups: state.groups.map(g => (g.id === id ? { ...g, buffs: resizedBuffs } : g)),
          }));
        }
      },
      rescaleAllGroupsOnLoad: async () => {
        const allGroups = get().groups;

        const updatedGroupsPromises = allGroups.map(async (group) => {
          const scaleDecimal = group.scale / 100.0;
          
          const resizedBuffsPromises = group.buffs.map(async (buff) => {
            const scaledPromise = buff.imageData ? resizedataURL(buff.imageData, scaleDecimal) : Promise.resolve(null);
            const desaturatedPromise = buff.desaturatedImageData ? resizedataURL(buff.desaturatedImageData, scaleDecimal) : Promise.resolve(null);
            
            const [scaledResult, desaturatedResult] = await Promise.all([scaledPromise, desaturatedPromise]);
            
            return {
              ...buff,
              scaledImageData: scaledResult?.scaledDataUrl,
              scaledDesaturatedImageData: desaturatedResult?.scaledDataUrl,
            };
          });

          const resizedBuffs = await Promise.all(resizedBuffsPromises);
          return { ...group, buffs: resizedBuffs };
        });

        const finalUpdatedGroups = await Promise.all(updatedGroupsPromises);
        
        set({ groups: finalUpdatedGroups });
        console.log("All groups have been rescaled on initial load.");
      },
      // Buffs
      addBuffToGroup: (groupId, buffId) => {
        const buff = get().buffs.find(b => b.id === buffId);
        if (buff) {
          set(state => ({
            groups: state.groups.map(g =>
              g.id === groupId ? { ...g, buffs: [...g.buffs, buff] } : g
            )
          }));
        }
      },
      removeBuffFromGroup: (groupId, buffId) => {
        set(state => ({
          groups: state.groups.map(g =>
            g.id === groupId ? { ...g, buffs: g.buffs.filter(b => b.id !== buffId) } : g
          )
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
              groups: state.groups.map(g =>
                g.id === groupId ? { ...g, buffs: newBuffs } : g
              )
            };
          }
          return state;
        });
      },
    }),
    {
      name: 'buff-tracker-storage',
      partialize: (state) => ({
        groups: state.groups,
        profiles: state.profiles,
        activeProfile: state.activeProfile,
        buffs: state.buffs,
        version: state.version,
      }),
    }
  )
);

export default useStore;