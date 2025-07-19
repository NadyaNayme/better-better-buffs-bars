import type { StateCreator } from 'zustand';
import type { Store } from '../types/Store';
import { debugLog } from '../lib/debugLog';

type PlayerInfo = {
    hitpoints: number,
    adrenaline: number,
    prayer: number,
}

export interface CombatSlice {
  player: PlayerInfo,
  hasTarget: boolean,
  currentTarget: string | null,
  currentTargetHitpoints: number | null,
  setHitpoints: (hitpoints: number) => void;
  setAdrenaline: (adrenaline: number) => void;
  setPrayer: (prayer: number) => void;
  setHasTarget: (inCombat: boolean) => void;
  setCurrentTarget: (name: string | null) => void;
  setCurrentTargetHitpoints: (hitpoints: number | null) => void;
}

export const createCombatSlice: StateCreator<Store, [], [], CombatSlice> = (set) => ({
    player: {hitpoints: 1, adrenaline: 1, prayer: 1},
    hasTarget: false,
    currentTarget: null,
    currentTargetHitpoints: null,
    setHitpoints: (hitpoints) => {
        debugLog.info(`Player hipoints: ${hitpoints}`);
        set((state) => ({
          player: {
            ...state.player,
            hitpoints,
          },
        }))
    },
    
    setAdrenaline: (adrenaline) => {
        debugLog.info(`Player adrenaline: ${adrenaline}`);
        set((state) => ({
            player: {
            ...state.player,
            adrenaline,
            },
        }))
    },

    setPrayer: (prayer) => {
        debugLog.info(`Player prayer: ${prayer}`);
        set((state) => ({
            player: {
            ...state.player,
            prayer,
            },
        }))
    },

    setHasTarget: (hasTarget) => {
        debugLog.info(`Player has target: ${hasTarget}`);
        set(() => ({
            hasTarget: hasTarget
        }))
    },

    setCurrentTarget: (name) => {
        debugLog.info(`Player fighting against: ${name}`);
        set(() => ({
            currentTarget: name,
        }))
    },
    setCurrentTargetHitpoints: (hitpoints) => {
        debugLog.info(`Enemy hitpoints remaining: ${hitpoints}`);
        set(() => ({
            currentTargetHitpoints: hitpoints
        }))
    },
});