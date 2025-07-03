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
  duration?: number;
  cooldown?: number;
  cooldownRemaining?: number;
  timeRemaining?: number;
  isPermanent?: boolean;
  hasAlert?: boolean;
  buffType?: string;
  isActive: boolean;
  alwaysActive?: boolean;
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
        set((state) => ({
          groups: state.groups.map(group => ({
            ...group,
            buffs: group.buffs.map(buffInGroup => {
              
              const activeInfo = identifiedActiveBuffs.get(buffInGroup.name);

              // --- META BUFF LOGIC ---
              if (buffInGroup.buffType === "Meta") {
                // Case 1a: The meta buff has an active child. Update it.
                if (activeInfo && activeInfo.foundChild) {
                  return {
                    ...buffInGroup,
                    isActive: true,
                    timeRemaining: activeInfo.time,
                    imageData: activeInfo.foundChild.imageData,
                    desaturatedImageData: activeInfo.foundChild.desaturatedImageData,
                    scaledImageData: '',
                    scaledDesaturatedImageData: '',
                  };
                }
                // Case 1b: The meta buff has NO active child. It must be made inactive.
                else {
                  return {
                    ...buffInGroup,
                    imageData: '',
                    desaturatedImageData: '',
                    scaledImageData: '',
                    scaledDesaturatedImageData: '',
                  };
                }
              }

              // --- NORMAL BUFF LOGIC ---
              else {
                // Case 2a: A normal buff is active.
                if (activeInfo) {
                  return {
                    ...buffInGroup,
                    timeRemaining: activeInfo.time,
                    isActive: true,
                  };
                }
                
                // Case 2b: A normal buff is NOT active. Handle decay/cooldown.
                else if (buffInGroup.isActive) {

                  // This decay logic now only applies to normal buffs.
                  if (buffInGroup.timeRemaining === 1) {
                    return {
                      ...buffInGroup,
                      timeRemaining: 0,
                      isActive: false,
                      cooldownRemaining: buffInGroup.cooldown ?? 0,
                    };
                  }
                  const newTime = Math.max(0, (buffInGroup.timeRemaining ?? 0) - 1);
                  return {
                    ...buffInGroup,
                    timeRemaining: newTime,
                    isActive: newTime > 0 || !!buffInGroup.alwaysActive,
                  };
                }

                
                else {
                  // Case 2d: A normal buff is already inactive. Do nothing.
                  return buffInGroup;
                }
              }
            }),
          })),
        }));
      },
      tickCooldownTimers: () => {
        set((state) => ({
          groups: state.groups.map(group => ({
            ...group,
            buffs: group.buffs.map(buff => {
              if (buff.cooldownRemaining && buff.cooldownRemaining > 0) {
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