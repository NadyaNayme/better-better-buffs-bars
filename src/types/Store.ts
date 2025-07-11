import type { Buff } from './Buff';
import type { Profile } from './Profile';
import type { Group } from './Group';
import type { Color } from './Color';
import a1lib from 'alt1';

export interface Store {
    groups: Group[];
    profiles: Profile[];
    activeProfile: string | null;
    buffs: Buff[];
    version: number;
    cooldownColor: Color,
    timeRemainingColor: Color,
    combatCheck: boolean,
    enableAlerts: boolean,
    alertVolume: number,
    debugMode: boolean,
    setEnableCombatCheck: (enabled: boolean) => void;
    setEnableAlerts: (enabled: boolean) => void;
    setAlertVolume: (volume: number) => void;
    setDebugMode: (enabled: boolean) => void;
    inCombat: boolean,
    setInCombat: (value: boolean) => void;
    setVersion: (version: number) => void;
    setBuffsFromJsonIfNewer: () => void;
    syncIdentifiedBuffs: (foundBuffsMap: Map<string, any>) => void;
    tickCooldownTimers: () => void;
    createProfile: (name: string) => void;
    loadProfile: (id: string) => void;
    deleteProfile: (id: string) => void;
    saveProfile: (id: string) => void;
    editProfile: (id: string, newName: string) => void;
    createGroup: (name: string) => void;
    deleteGroup: (id: string) => void;
    updateGroup: (id: string, updates: Partial<Group>) => void;
    addBuffToGroup: (groupId: string, buffId: string) => void;
    rescaleAllGroupsOnLoad: () => void;
    syncGroupBuffs: (buffs: Array<Buff>) => void;
    removeBuffFromGroup: (groupId: string, buffId: string) => void;
    reorderBuffsInGroup: (groupid: string, oldIndex: number, newIndex: number) => void;
    setCooldownColor: (color: Color) => void;
    setTimeRemainingColor: (color: Color) => void;
    customThresholds: { [buffName: string]: { passThreshold: number, failThreshold: number } };
    setCustomThreshold: (buffName: string, thresholds: { passThreshold: number, failThreshold: number }) => void;
    getBuffThresholds: (buffName: string) => { passThreshold: number; failThreshold: number };
    removeCustomThreshold: (buffName: string) => void;
    lastMobNameplatePos: a1lib.PointLike | null;
    targetReaderStatus: string;
    setLastMobNameplatePos: (pos: a1lib.PointLike | null) => void;
    setTargetReaderStatus: (status: string) => void;
}