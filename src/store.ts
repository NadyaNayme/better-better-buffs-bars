import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import buffsData from './buffs.json';
import { type Group } from './types/Group';
import { type Store } from './types/Store';
import { createBlankBuff } from './lib/createBlankBuff';
import { alertsMap } from './lib/alerts';
import { toast } from 'sonner';

function resizedataURL(dataUrl: string, scale: number): Promise<{ scaledDataUrl: string; width: number; height: number }> {
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
  
        const scaledDataUrl = canvas.toDataURL('image/png');
        resolve({ scaledDataUrl, width, height });
      };
  
      img.onerror = (err) => reject(err);
      img.src = dataUrl;
    });
  }

const useStore = create(
  persist<Store, [], [], Store>(
    (set, get) => ({
      groups: [],
      profiles: [],
      activeProfile: null,
      buffs: buffsData.buffs.map(buff => ({ ...buff, id: uuidv4() })),
      version: 1,
      setVersion: (version) => set({ version }),
      combatCheck: true,
      enableAlerts: true,
      alertVolume: 100,
      debugMode: false,
      setEnableCombatCheck: (enabled: boolean) => { 
        const currentValue = get().combatCheck;
        if (enabled === currentValue) return;
        set({combatCheck: enabled})
      },
      setEnableAlerts: (enabled: boolean) => {
        const currentValue = get().enableAlerts;
        if (enabled === currentValue) return;
        set({ enableAlerts: enabled })
      },
      setAlertVolume: (volume: number) => {
        const currentValue = get().alertVolume;
        if (volume === currentValue) return;
        set({ alertVolume: volume })
      },
      setDebugMode: (enabled: boolean) => {
        const currentValue = get().debugMode;
        if (enabled === currentValue) return;
        set({ debugMode: enabled })
      },
      inCombat: false,
      setInCombat: (value: boolean) => {
        const currentValue = get().inCombat;
        if (value === currentValue) return;
        set({ inCombat: value })
      },
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
          let globalDidChange = false;
          const now = Date.now();
      
          const updatedGroups = state.groups.map(group => {
            let groupDidChange = false;
      
            const updatedBuffs = group.buffs.map(buff => {
              const activeInfo = identifiedActiveBuffs.get(buff.name);
      
              if (buff.buffType === "Meta") {
                if (activeInfo && activeInfo.foundChild) {
                  groupDidChange = true;
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
                } else if (buff.isActive) {
                  const timeSinceLastUpdate = now - (buff.lastUpdated ?? 0);
                  if (timeSinceLastUpdate > 400) {
                    const newInactiveCount = (buff.inactiveCount ?? 0) + 1;
                    if (newInactiveCount >= 3) {
                      groupDidChange = true;
                      return {
                        ...buff,
                        isActive: false,
                        timeRemaining: 0,
                        inactiveCount: 0,
                        imageData: buff.defaultImageData ?? '',
                        lastUpdated: now,
                      };
                    } else {
                      groupDidChange = true;
                      return {
                        ...buff,
                        isActive: true,
                        inactiveCount: newInactiveCount,
                        lastUpdated: now,
                      };
                    }
                  }
                }
                return buff;
              }
      
              if (activeInfo) {
                if (
                  buff.cooldownRemaining !== 0 && !buff.isActive ||
                  buff.timeRemaining !== activeInfo.time
                ) {
                  groupDidChange = true;
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
      
              if (buff.isActive) {
                const elapsedMs = now - (buff.lastUpdated ?? now);
                const elapsedSeconds = Math.floor(elapsedMs / 1000);
      
                if (elapsedSeconds > 0) {
                  const timeLeft = buff.timeRemaining ?? 0;
                  const newTime = Math.max(0, timeLeft - elapsedSeconds);

                  if (buff.isStack) return buff;
      
                  if (newTime === 0) {
                    groupDidChange = true;
                    return {
                      ...buff,
                      isActive: false,
                      timeRemaining: 0,
                      cooldownRemaining: buff.cooldown ?? 0,
                      lastUpdated: now,
                      hasAlerted: false,
                    };
                  } else if (newTime !== timeLeft && timeLeft < 60) {
                    groupDidChange = true;
                    return {
                      ...buff,
                      timeRemaining: newTime,
                      isActive: true,
                      lastUpdated: now,
                    };
                  }
                }
              }
      
              return buff;
            });
      
            if (groupDidChange) {
              globalDidChange = true;
              return { ...group, buffs: updatedBuffs };
            }
      
            return group;
          });
      
          return globalDidChange ? { groups: updatedGroups } : {};
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
              const newTime = buff.timeRemaining;
              const { enableAlerts, alertVolume } = useStore.getState();
              if (newTime === buff.alertThreshold && !buff.hasAlerted && alertsMap[buff.name] && enableAlerts) {
                const sound = new Audio(alertsMap[buff.name]);
                sound.volume = alertVolume / 100;
                sound.play().catch(() => {});
                return {
                  ...buff,
                  lastUpdated: now,
                  hasAlerted: newTime === buff.alertThreshold ? true : false,
                };
              }
              if (buff.isStack) return buff;
              if (buff.cooldownRemaining && buff.cooldownRemaining > 0 && buff.cooldownRemaining < 60) {
                const newTime = buff.cooldownRemaining - 1;
                 return {
                  ...buff,
                  cooldownRemaining: newTime,
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
          toast.success(`${profile.name} Loaded`);
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
        const blankBuff = createBlankBuff();
        const newGroup: Group = {
          id: uuidv4(),
          name,
          buffs: [blankBuff],
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
          groups: state.groups.map(group => {
            if (group.id !== id) return group;
            const updatedGroup = { ...group, ...updates };
            const nonBlankBuffs = updatedGroup.buffs.filter(b => b.name !== "Blank");
            updatedGroup.buffs = [...nonBlankBuffs, createBlankBuff()];
      
            return updatedGroup;
          }),
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
              scaledImageData: scaledResult?.scaledDataUrl ?? '',
              scaledDesaturatedImageData: desaturatedResult?.scaledDataUrl ?? '',
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
              scaledImageData: scaledResult?.scaledDataUrl ?? '',
              scaledDesaturatedImageData: desaturatedResult?.scaledDataUrl ?? '',
            };
          });

          const resizedBuffs = await Promise.all(resizedBuffsPromises);
          return { ...group, buffs: resizedBuffs };
        });

        const finalUpdatedGroups = await Promise.all(updatedGroupsPromises);
        
        set({ groups: finalUpdatedGroups });
        console.log("All groups have been rescaled on initial load.");
      },
      syncGroupBuffs: () => {
      },
      // Buffs
      addBuffToGroup: (groupId, buffId) => {
        const buff = get().buffs.find(b => b.id === buffId);
        if (!buff) return;
      
        set(state => ({
          groups: state.groups.map(g => {
            if (g.id !== groupId) return g;
      
            const nonBlankBuffs = g.buffs.filter(b => b.name !== "Blank");
            const blankBuff = g.buffs.find(b => b.name === "Blank");
      
            return {
              ...g,
              buffs: [...nonBlankBuffs, buff, ...(blankBuff ? [blankBuff] : [])],
            };
          }),
        }));
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
      // User Settings
      cooldownColor: { r: 255, g: 255, b: 0 },
      timeRemainingColor: { r: 255, g: 255, b: 255 },
      setCooldownColor: (color) => set({ cooldownColor: color }),
      setTimeRemainingColor: (color) => set({ timeRemainingColor: color }),
      customThresholds: {}, // { [buffName: string]: { passThreshold: number, failThreshold: number } }
      setCustomThreshold: (buffName, thresholds) =>
        set((state) => ({
          customThresholds: {
            ...state.customThresholds,
            [buffName]: thresholds,
          },
        })),
      getBuffThresholds: (buffName: string) => {
        const custom = get().customThresholds?.[buffName];
        const baseBuff = get().buffs.find((b) => b.name === buffName);
        return {
          passThreshold: custom?.passThreshold ?? baseBuff?.passThreshold ?? 10,
          failThreshold: custom?.failThreshold ?? baseBuff?.failThreshold ?? 50,
        };
      },
      removeCustomThreshold: (buffName) => {
        set((state) => {
          const updated = { ...state.customThresholds };
          delete updated[buffName];
          return { customThresholds: updated };
        });
      },
    }),
    {
      name: 'buff-tracker-storage',
      partialize: (state: Store) => ({
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
      }),
    } as PersistOptions<Store>
  )
);

export default useStore;