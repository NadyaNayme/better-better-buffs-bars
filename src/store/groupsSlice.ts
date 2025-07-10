import { useStore, type StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { type Store } from '../types/Store';
import { type Group } from '../types/Group';
import { createBlankBuff } from '../lib/createBlankBuff';
import { resizedataURL } from '../lib/resizeDataURL';
import { alertsMap } from '../lib/alerts';
import type { Buff } from '../types/Buff';

export interface GroupsSlice {
  groups: Group[];
  createGroup: (name: string) => void;
  deleteGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<void>;
  rescaleAllGroupsOnLoad: () => Promise<void>;
  addBuffToGroup: (groupId: string, buffId: string) => void;
  removeBuffFromGroup: (groupId: string, buffId: string) => void;
  reorderBuffsInGroup: (groupId: string, oldIndex: number, newIndex: number) => void;
  tickCooldownTimers: () => void;
  syncGroupBuffs: (buffs: Buff[]) => void;
  syncIdentifiedBuffs: (foundBuffsMap: Map<string, any>) => void;
}

export const createGroupsSlice: StateCreator<Store, [], [], GroupsSlice> = (set, get) => ({
  groups: [],

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
      children: [],
    };
    set((state) => ({ groups: [...state.groups, newGroup] }));
  },

  deleteGroup: (id) => {
    set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
  },

  updateGroup: async (id, updates) => {
    set((state) => ({
      groups: state.groups.map((group) => {
        if (group.id !== id) return group;
        const updatedGroup = { ...group, ...updates };
        const nonBlankBuffs = updatedGroup.buffs.filter((b) => b.name !== 'Blank');
        updatedGroup.buffs = [...nonBlankBuffs, createBlankBuff()];
        return updatedGroup;
      }),
    }));

    if (updates.scale !== undefined) {
      const groupToProcess = get().groups.find((g) => g.id === id);
      if (!groupToProcess) return;
      const newScaleDecimal = updates.scale / 100.0;

      const resizePromises = groupToProcess.buffs.map(async (buff) => {
        const scaled = buff.imageData ? await resizedataURL(buff.imageData, newScaleDecimal) : null;
        const desat = buff.desaturatedImageData ? await resizedataURL(buff.desaturatedImageData, newScaleDecimal) : null;
        return {
          ...buff,
          scaledImageData: scaled?.scaledDataUrl ?? '',
          scaledDesaturatedImageData: desat?.scaledDataUrl ?? '',
        };
      });

      const resizedBuffs = await Promise.all(resizePromises);
      set((state) => ({
        groups: state.groups.map((g) => (g.id === id ? { ...g, buffs: resizedBuffs } : g)),
      }));
    }
  },

  rescaleAllGroupsOnLoad: async () => {
    const allGroups = get().groups;
    const updatedGroupsPromises = allGroups.map(async (group) => {
      const scaleDecimal = group.scale / 100.0;
      const resizedBuffs = await Promise.all(
        group.buffs.map(async (buff) => {
          const scaled = buff.imageData ? await resizedataURL(buff.imageData, scaleDecimal) : null;
          const desat = buff.desaturatedImageData ? await resizedataURL(buff.desaturatedImageData, scaleDecimal) : null;
          return {
            ...buff,
            scaledImageData: scaled?.scaledDataUrl ?? '',
            scaledDesaturatedImageData: desat?.scaledDataUrl ?? '',
          };
        })
      );

      const resizedChildren = await Promise.all(
        (group.children ?? []).map(async (child) => {
          const scaled = child.imageData ? await resizedataURL(child.imageData, scaleDecimal) : null;
          const desat = child.desaturatedImageData ? await resizedataURL(child.desaturatedImageData, scaleDecimal) : null;
          return {
            ...child,
            scaledImageData: scaled?.scaledDataUrl ?? '',
            scaledDesaturatedImageData: desat?.scaledDataUrl ?? '',
          };
        })
      );

      return {
        ...group,
        buffs: resizedBuffs,
        children: resizedChildren,
      };
    });

    const finalGroups = await Promise.all(updatedGroupsPromises);
    set({ groups: finalGroups });
  },

  addBuffToGroup: (groupId, buffId) => {
    const buff = get().buffs.find((b) => b.id === buffId);
    if (!buff) return;
    set((state) => ({
      groups: state.groups.map((g) => {
        if (g.id !== groupId) return g;
        const nonBlankBuffs = g.buffs.filter((b) => b.name !== 'Blank');
        const blank = g.buffs.find((b) => b.name === 'Blank');
        return {
          ...g,
          buffs: [...nonBlankBuffs, buff, ...(blank ? [blank] : [])],
        };
      }),
    }));
  },

  removeBuffFromGroup: (groupId, buffId) => {
    set((state) => ({
      groups: state.groups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          buffs: group.buffs.filter((b) => b.id !== buffId),
        };
      }),
    }));
  },

  reorderBuffsInGroup: (groupId, oldIndex, newIndex) => {
    set((state) => {
      const group = state.groups.find((g) => g.id === groupId);
      if (!group) return state;
      const newBuffs = [...group.buffs];
      const [moved] = newBuffs.splice(oldIndex, 1);
      newBuffs.splice(newIndex, 0, moved);
      return {
        groups: state.groups.map((g) => (g.id === groupId ? { ...g, buffs: newBuffs } : g)),
      };
    });
  },
    tickCooldownTimers: () => {
    const now = Date.now();
    set((state) => ({
        groups: state.groups.map(group => ({
        ...group,
        buffs: group.buffs.map(buff => {
            const state = get();
            const recentlyUpdated = now - (buff.lastUpdated ?? 0) < 500;
            if (recentlyUpdated) return buff;
            const newTime = buff.timeRemaining;
            const { enableAlerts, alertVolume } = state;
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
            if (buff.buffType === "Enemy Debuff") return buff;
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
    syncGroupBuffs: () => {
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
                  const foundChildBuff = group.children.find(
                    child => child.name === activeInfo.foundChild.name
                  ) as Buff;
                  const shouldUpdate =
                  !buff.isActive ||
                  buff.timeRemaining !== activeInfo.time ||
                  buff.imageData !== foundChildBuff.imageData ||
                  buff.scaledImageData !== foundChildBuff.scaledImageData;
                  if (shouldUpdate) {
                    groupDidChange = true;
                    return {
                      ...buff,
                      isActive: true,
                      timeRemaining: activeInfo.time,
                      imageData: foundChildBuff.imageData,
                      desaturatedImageData: foundChildBuff.desaturatedImageData,
                      scaledImageData: foundChildBuff.scaledImageData ?? '',
                      scaledDesaturatedImageData: foundChildBuff.scaledDesaturatedImageData ?? '',
                      inactiveCount: 0,
                      lastUpdated: now,
                    };
                  }
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
});