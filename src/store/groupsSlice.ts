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
    const saveProfile = get().saveProfile;
    const activeProfile = get().activeProfile;
    if (activeProfile) {
        saveProfile(activeProfile);
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
            if (buff.isActive !== updatePayload.isActive) {
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

      debugLog.success(`Syncing ${payloadMap.size} identified buffs to store.`);
      
      return { groups: newGroups };
    });
  },
});