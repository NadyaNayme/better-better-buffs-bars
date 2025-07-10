import { useCallback } from 'react';
import useStore from '../store';
import { alertsMap } from '../lib/alerts';

export function useCooldownTicker() {
  const groups = useStore((state) => state.groups);
  const enableAlerts = useStore((state) => state.enableAlerts);
  const alertVolume = useStore((state) => state.alertVolume);
  const updateGroup = useStore((state) => state.updateGroup);

  const tickCooldownTimers = useCallback(() => {
    const now = Date.now();

    groups.forEach((group) => {
      let didChange = false;

      const updatedBuffs = group.buffs.map((buff) => {
        const recentlyUpdated = now - (buff.lastUpdated ?? 0) < 500;
        if (recentlyUpdated) return buff;

        const newTime = buff.timeRemaining;

        if (
          newTime === buff.alertThreshold &&
          !buff.hasAlerted &&
          alertsMap[buff.name] &&
          enableAlerts
        ) {
          const sound = new Audio(alertsMap[buff.name]);
          sound.volume = alertVolume / 100;
          sound.play().catch(() => {});
          didChange = true;
          return {
            ...buff,
            lastUpdated: now,
            hasAlerted: true,
          };
        }

        if (buff.isStack || buff.buffType === 'Enemy Debuff') {
          return buff;
        }

        if (
          buff.cooldownRemaining &&
          buff.cooldownRemaining > 0 &&
          buff.cooldownRemaining < 60
        ) {
          didChange = true;
          return {
            ...buff,
            cooldownRemaining: buff.cooldownRemaining - 1,
          };
        }

        return buff;
      });

      if (didChange) {
        updateGroup(group.id, { buffs: updatedBuffs });
      }
    });
  }, [groups, enableAlerts, alertVolume, updateGroup]);

  return tickCooldownTimers;
}