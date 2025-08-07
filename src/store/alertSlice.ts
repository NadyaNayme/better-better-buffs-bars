import type { StateCreator } from 'zustand';
import type { Store } from '../types/Store';
import { alertsMap } from '../data/alerts';

export type VoiceType = 'Callum' | 'Lily';

export interface AlertsSlice {
  alertEnabledMap: Record<string, boolean>;
  voice: VoiceType;
  toggleAlert: (name: string) => void;
  setVoice: (voice: VoiceType) => void;
}

export const createAlertsSlice: StateCreator<Store, [], [], AlertsSlice> = (set) => ({
  alertEnabledMap: Object.fromEntries(
    alertsMap.map(({ key, category }) => [key, category.includes('Informative')])
  ),
  voice: 'Callum',

  toggleAlert: (name) =>
    set((state) => ({
      alertEnabledMap: {
        ...state.alertEnabledMap,
        [name]: !state.alertEnabledMap[name],
      },
    })),

  setVoice: (voice) => set({ voice }),
});