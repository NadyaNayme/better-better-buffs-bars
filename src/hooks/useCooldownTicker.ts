import { useCallback, useRef } from 'react';
import useStore from '../store';
import { alertsMap } from '../data/alerts';
import { isRuntimeBuff } from '../types/Buff';

const lastTickedMap = new Map<string, number>();

export function useCooldownTicker() {
  // const groups = useStore((state) => state.groups);
  // const enableAlerts = useStore((state) => state.enableAlerts);
  // const alertVolume = useStore((state) => state.alertVolume);
  // const updateGroup = useStore((state) => state.updateGroup);

  const lastRunRef = useRef(0);

  const tickCooldownTimers = useCallback(() => {
    const now = Date.now();

    if (now - lastRunRef.current < 1000) {
        return;
    }

    lastRunRef.current = now;

    const { groups, enableAlerts, alertVolume, updateGroup } = useStore.getState();

    groups.forEach((group) => {
      let didChange = false;

      const updatedBuffs = group.buffs.map((buff) => {
        if (!isRuntimeBuff(buff)) return buff;
        const key = `${group.id}-${buff.name}`;

        const newTime = buff.timeRemaining;

        if (
          newTime === buff.alert &&
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

        if (buff.type === 'StackBuff' || buff.type === 'TargetDebuff') {
          return buff;
        }


        const lastTick = lastTickedMap.get(key) ?? 0;
        if (
          buff.cooldownRemaining &&
          buff.cooldownRemaining > 0 &&
          now - lastTick >= 1000
        ) {
          didChange = true;
          lastTickedMap.set(key, now);
          return {
            ...buff,
            cooldownRemaining: Math.max(0, buff.cooldownRemaining - 1),
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