import { type StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { type Store } from '../types/Store';
import { type Group } from '../types/Group';
import { createBlankBuff } from '../lib/createBlankBuff';
import { resizedataURL } from '../lib/resizeDataURL';
import { isRuntimeBuff, type Buff } from '../types/Buff';
import { debugLog } from '../lib/debugLog';

export interface GroupsSlice {
  groups: Group[];
  createGroup: (name: string) => void;
  deleteGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<void>;
  updateGroups: (groups: Group[]) => void;
  addBuffToGroup: (groupId: string, buffId: string) => void;
  removeBuffFromGroup: (groupId: string, buffId: string) => void;
  reorderBuffsInGroup: (groupId: string, oldIndex: number, newIndex: number) => void;
  moveBuffBetweenGroups: (fromGroupId: string, toGroupId: string, buffId: string, insertAt: number) => void;
  syncIdentifiedBuffs: (foundBuffsMap: Map<string, any>) => void;
  updateBuffAlertState: (buffName: string, hasAlerted: boolean) => void;
  forceDeactivateBuffs: (buffIds: string[]) => void;
}

export const createGroupsSlice: StateCreator<Store, [], [], GroupsSlice> = (set, get) => ({
  groups: [],

  createGroup: (name) => {
    const blankBuff = createBlankBuff(0);
    const newGroup: Group = {
      id: uuidv4(),
      name,
      buffs: [blankBuff],
      overlayPosition: { x: 0, y: 0 },
      buffsPerRow: 8,
      scale: 100,
      hideOutsideCombat: false,
      explicitInactive: true,
      enabled: true,
      children: [],
    };
    set((state) => ({ groups: [...state.groups, newGroup] }));
    const saveProfile = get().saveProfile;
    const activeProfile = get().activeProfile;
    if (activeProfile) {
        saveProfile(activeProfile);
    }
  },

  deleteGroup: (id) => {
    set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
    const saveProfile = get().saveProfile;
    const activeProfile = get().activeProfile;
    if (activeProfile) {
        saveProfile(activeProfile);
    }
  },

  updateGroup: async (id, updates) => {
    set((state) => ({
      groups: state.groups.map((group) => {
        if (group.id !== id) return group;
        let updatedBuffs = group.buffs;
  
        if (updates.buffs) {
          const updateMap = new Map(
            updates.buffs.map((b) => [b.name, b])
          );
  
          updatedBuffs = group.buffs.map((oldBuff) => {
            const newBuff = updateMap.get(oldBuff.name);
            return newBuff
              ? { ...oldBuff, ...newBuff }
              : oldBuff;
          });
        }
  
        // Always keep a blank buff at the end
        const nonBlankBuffs = updatedBuffs.filter((b) => b.name !== 'Blank');
        const finalBuffs = [...nonBlankBuffs, createBlankBuff(group.buffs.length - 1)];
  
        return {
          ...group,
          ...updates,
          buffs: finalBuffs,
        };
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
        groups: state.groups.map((g) => {
          if (g.id !== id) return g;
    
          const resizedMap = new Map(resizedBuffs.map((b) => [b.name, b]));
    
          const mergedBuffs = g.buffs.map((buff) => {
            const resized = resizedMap.get(buff.name);
            return resized ? { ...buff, ...resized } : buff;
          });
    
          return { ...g, buffs: mergedBuffs };
        }),
      }));
    }
  },

  updateGroups: (newGroups) => {
    set(() => ({
      groups: newGroups,
    }));
  },

  addBuffToGroup: (groupId, buffId) => {
    const buff = get().buffs.find((b) => { 
      if (!isRuntimeBuff(b)) return false;
      return b.id === buffId;
    });
    if (!buff) return;
  
    set((state) => ({
      groups: state.groups.map((g) => {
        if (g.id !== groupId) return g;
        let newChildren = g.children ?? [];
  
        if (buff.type === 'MetaBuff' && buff.children) {
            const childBuffs = buff.children
              .map(childName => {
                const found = get().buffs.find(b => isRuntimeBuff(b) && b.name === childName);
                return found ? { ...found } : null;
              })
              .filter((b): b is Buff => b !== null);
          
          const mergedChildren = [...newChildren, ...childBuffs];
          newChildren = Array.from(new Map(mergedChildren.map(b => [b.name, b])).values());
        }
  
        const nonBlankBuffs = g.buffs.filter((b) => b.name !== 'Blank');
        const blank = g.buffs.find((b) => b.name === 'Blank');

        const indexedBuffs = [...nonBlankBuffs, buff, ...(blank ? [blank] : [])].map((buff, index) => ({
          ...buff,
          index,
        }));
  
        return {
          ...g,
          buffs: indexedBuffs,
          children: newChildren,
        };
      }),
    }));
    const saveProfile = get().saveProfile;
    const activeProfile = get().activeProfile;
    if (activeProfile) {
        saveProfile(activeProfile);
    }
  },
  moveBuffBetweenGroups: (fromGroupId, toGroupId, buffId, insertAt) => {
    set((state) => {
      const fromGroup = state.groups.find(g => g.id === fromGroupId);
      const toGroup = state.groups.find(g => g.id === toGroupId);
      if (!fromGroup || !toGroup) return {};
  
      const buffIndex = fromGroup.buffs.findIndex(b => {
        if (!isRuntimeBuff(b)) return false;
        return b.id === buffId;
      });
      if (buffIndex === -1) return {};
  
      const [movedBuff] = fromGroup.buffs.splice(buffIndex, 1);
  
      // Temporarily remove "Blank" from destination
      const nonBlankBuffs = toGroup.buffs.filter(b => b.name !== 'Blank');
      const blankBuff = toGroup.buffs.find(b => b.name === 'Blank');
  
      // Clamp insertAt to nonBlankBuffs.length to prevent inserting before Blank
      const clampedInsertAt = Math.min(insertAt, nonBlankBuffs.length);
  
      // Insert movedBuff
      nonBlankBuffs.splice(clampedInsertAt, 0, movedBuff);
  
      // Rebuild buffs with blank last
      const newBuffs = [...nonBlankBuffs, ...(blankBuff ? [blankBuff] : [])];
  
      const updatedGroups = state.groups.map(group => {
        if (group.id === fromGroupId) {
          return {
            ...group,
            buffs: group.buffs.map((b, i) => ({ ...b, index: i })),
          };
        }
        if (group.id === toGroupId) {
          return {
            ...group,
            buffs: newBuffs.map((b, i) => ({ ...b, index: i })),
          };
        }
        return group;
      });
  
      return { groups: updatedGroups };
    });
  
    // Persist the profile if active
    const saveProfile = get().saveProfile;
    const activeProfile = get().activeProfile;
    if (activeProfile) {
      saveProfile(activeProfile);
    }
  },
  removeBuffFromGroup: (groupId, buffId) => {
    set((state) => ({
      groups: state.groups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          buffs: group.buffs.filter((b) => {
            if (!isRuntimeBuff(b)) return true;
            return b.id !== buffId
          }),
        };
      }),
    }));
    const saveProfile = get().saveProfile;
    const activeProfile = get().activeProfile;
    if (activeProfile) {
        saveProfile(activeProfile);
    }
  },

  reorderBuffsInGroup: (groupId, oldIndex, newIndex) => {
    set((state) => {
      const group = state.groups.find((g) => g.id === groupId);
      if (!group) return state;
      const newBuffs = [...group.buffs];
      const [moved] = newBuffs.splice(oldIndex, 1);
      newBuffs.splice(newIndex, 0, moved);
      const indexedBuffs = newBuffs.map((buff, index) => ({
        ...buff,
        index,
      }));
      return {
        groups: state.groups.map((g) => (g.id === groupId ? { ...g, buffs: indexedBuffs } : g)),
      };
    });
    const saveProfile = get().saveProfile;
    const activeProfile = get().activeProfile;
    if (activeProfile) {
        saveProfile(activeProfile);
    }
  },
  syncIdentifiedBuffs: (payloadMap: Map<string, any>) => {
    set((state) => {
      const masterBuffsMap = new Map(state.buffs.map(b => [b.name, b]));

      let hasAnyChanges = false;

      const newGroups = state.groups.map(group => {
        let hasChangesInThisGroup = false;

        const newBuffs = group.buffs.map(buff => {
          if (payloadMap.has(buff.name)) {
            const updatePayload = payloadMap.get(buff.name);
            if (!isRuntimeBuff(buff)) return
            if (buff.status !== updatePayload.status || buff.timeRemaining !== updatePayload.timeRemaining || buff.stacks !== updatePayload.stacks || buff.activeChild !== updatePayload.activeChild || buff.cooldownStart !== updatePayload.cooldownStart || buff.guaranteedActiveUntil !== updatePayload.guaranteedActiveUntil) {
              hasChangesInThisGroup = true;
              hasAnyChanges = true;

              return {
                ...masterBuffsMap.get(buff.name),
                ...buff,                         
                ...updatePayload,                
              };
            }
          }
          
          return buff;
        });

        if (hasChangesInThisGroup) {
          return { ...group, buffs: newBuffs };
        }
        
        return group;
      });

      if (!hasAnyChanges) {
        debugLog.verbose("No buff state changes detected that require an update.");
        return {};
      }

      debugLog.verbose(`Syncing ${payloadMap.size} identified buffs to store.`);
      
      return { groups: newGroups };
    });
  },
  forceDeactivateBuffs: (buffIds: string[]) => {
    set((state) => {
      const idsToDeactivate = new Set(buffIds);

      const newGroups = state.groups.map(group => {
        const updateBuffs = (buffs: Buff[]) => {
          return buffs.map(buff => {
            if (!isRuntimeBuff(buff)) return buff;
            if (idsToDeactivate.has(buff.id)) {
              return {
                ...buff,
                status: 'Inactive',
                timeRemaining: 0,
                guaranteedActiveUntil: 0,
              };
            }
            return buff;
          });
        };
        
        return {
          ...group,
          buffs: updateBuffs(group.buffs),
          children: updateBuffs(group.children),
        };
      });

      return { groups: newGroups };
    });
  },
  updateBuffAlertState: (buffName, hasAlerted) =>
    set((state) => ({
      groups: state.groups.map((group) => ({
        ...group,
        buffs: group.buffs.map((buff) =>
          buff.name === buffName && isRuntimeBuff(buff) && buff.alert
            ? {
                ...buff,
                alert: {
                  ...buff.alert,
                  hasAlerted,
                },
              }
            : buff
        ),
      })),
    })),
});