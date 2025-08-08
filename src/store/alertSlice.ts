import type { StateCreator } from 'zustand';
import type { Store } from '../types/Store';
import { alertsMap } from '../data/alerts';

export type VoiceType = 'Callum' | 'Lily';

export interface AlertsSlice {
  alerts: Record<string, boolean>;
  voice: VoiceType;
  toggleAlert: (name: string) => void;
  toggleCategory: (category: string) => void;
  areAllCategoryAlertsEnabled: (category: string) => boolean;
  toggleCollection: (collection: string) => void;
  toggleAll: (enabled: boolean) => void;
  setVoice: (voice: VoiceType) => void;
}

export const createAlertsSlice: StateCreator<Store, [], [], AlertsSlice> = (set, get) => ({
  alerts: alertsMap.reduce((acc, alert) => {
    acc[alert.key] = true;
    return acc;
  }, {} as Record<string, boolean>),
  voice: 'Callum',

  toggleAlert: (key) =>
    set((state) => ({
      alerts: {
        ...state.alerts,
        [key]: !state.alerts[key],
      },
    })),
  toggleCategory: (category) => {
    const allEnabled = get().areAllCategoryAlertsEnabled(category);
    const updated = { ...get().alerts };
    alertsMap
      .filter((a) => a.category.includes(category))
      .forEach((a) => {
        updated[a.key] = !allEnabled;
      });
    set({ alerts: updated });
  },
    toggleCollection: (collection: string) => {
      const entries = alertsMap.filter((a) => a.collection === collection);
      const allEnabled = entries.every((e) => get().alerts[e.key]);
      const copy = { ...get().alerts };
      entries.forEach((e) => (copy[e.key] = !allEnabled));
      set({ alerts: copy });
    },
  areAllCategoryAlertsEnabled: (category) => {
    return alertsMap
      .filter((a) => a.category.includes(category))
      .every((a) => get().alerts[a.key]);
  },

  toggleAll: (enabled) => {
    set({
      alerts: alertsMap.reduce((acc, alert) => {
        acc[alert.key] = enabled;
        return acc;
      }, {} as Record<string, boolean>),
    });
  },
  setVoice: (voice) => set({ voice }),
});