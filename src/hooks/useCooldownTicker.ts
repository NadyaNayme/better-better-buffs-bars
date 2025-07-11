import { useCallback, useRef } from 'react';
import useStore from '../store';
import { alertsMap } from '../lib/alerts';

const lastTickedMap = new Map<string, number>();

export function useCooldownTicker() {
  const groups = useStore((state) => state.groups);
  const enableAlerts = useStore((state) => state.enableAlerts);
  const alertVolume = useStore((state) => state.alertVolume);
  const updateGroup = useStore((state) => state.updateGroup);

  const lastRunRef = useRef(0);

  const tickCooldownTimers = useCallback(() => {
    const now = Date.now();

    if (now - lastRunRef.current < 1000) {
        return;
    }

    lastRunRef.current = now;

    groups.forEach((group) => {
      let didChange = false;

      const updatedBuffs = group.buffs.map((buff) => {
        const key = `${group.id}-${buff.name}`;
        const lastTick = lastTickedMap.get(key) ?? 0;

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
          lastTickedMap.set(key, now);
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
          buff.cooldownRemaining < 60 &&
          now - lastTick >= 1000
        ) {
          didChange = true;
          lastTickedMap.set(key, now);
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
  }, []);

  return tickCooldownTimers;
}