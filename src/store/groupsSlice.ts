import { type StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { type Store } from '../types/Store';
import { type Group } from '../types/Group';
import { createBlankBuff } from '../lib/createBlankBuff';
import { resizedataURL } from '../lib/resizeDataURL';
import { syncIdentifiedBuffsToGroups } from '../lib/buffSyncer';
import type { Buff } from '../types/Buff';

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
    const buff = get().buffs.find((b) => b.id === buffId);
    if (!buff) return;
  
    set((state) => ({
      groups: state.groups.map((g) => {
        if (g.id !== groupId) return g;
        let newChildren = g.children ?? [];
  
        if (buff.buffType === 'Meta' && buff.childBuffNames) {
            const childBuffs = buff.childBuffNames
              .map(childName => {
                const found = get().buffs.find(b => b.name === childName);
                return found ? { ...found } : null;
              })
              .filter((b): b is Buff => b !== null);
          
          const mergedChildren = [...newChildren, ...childBuffs];
          newChildren = Array.from(new Map(mergedChildren.map(b => [b.id, b])).values());
        }
  
        const nonBlankBuffs = g.buffs.filter((b) => b.name !== 'Blank');
        const blank = g.buffs.find((b) => b.name === 'Blank');
  
        return {
          ...g,
          buffs: [...nonBlankBuffs, buff, ...(blank ? [blank] : [])],
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
          buffs: group.buffs.filter((b) => b.id !== buffId),
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
      return {
        groups: state.groups.map((g) => (g.id === groupId ? { ...g, buffs: newBuffs } : g)),
      };
    });
    const saveProfile = get().saveProfile;
    const activeProfile = get().activeProfile;
    if (activeProfile) {
        saveProfile(activeProfile);
    }
  },
  syncIdentifiedBuffs: (identifiedActiveBuffs) => {
    set((state) => {
      const { didChangeMap, updatedGroups } = syncIdentifiedBuffsToGroups(state.groups, identifiedActiveBuffs);
      if (!didChangeMap.size) return {};
  
      return {
        groups: state.groups.map((group) =>
          didChangeMap.has(group.id) ? updatedGroups.get(group.id)! : group
        ),
      };
    });
  },
});