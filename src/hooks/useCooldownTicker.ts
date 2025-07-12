import { useCallback, useRef } from 'react';
import useStore from '../store';
import { alertsMap } from '../data/alerts';
import { isRuntimeBuff, type BuffInstance } from '../types/Buff';
import type { BuffInfo } from 'alt1/buffs';

const lastTickedMap = new Map<string, number>();

export function useCooldownTicker() {
  const lastRunRef = useRef(0);

  const tickCooldownTimers = useCallback(() => {
    const now = Date.now();
    if (now - lastRunRef.current < 1000) return;
    lastRunRef.current = now;

    const { groups, enableAlerts, alertVolume, updateGroup } = useStore.getState();

    groups.forEach((group) => {
      let didChange = false;

      const updatedBuffs = group.buffs.map((buff) => {
        if (!isRuntimeBuff(buff)) return buff;
        const key = `${group.id}-${buff.name}`;
        const newBuff = { ...buff };

        // Handle alert
        if (
          newBuff.timeRemaining === newBuff.alert &&
          !newBuff.hasAlerted &&
          alertsMap[newBuff.name] &&
          enableAlerts
        ) {
          const sound = new Audio(alertsMap[newBuff.name]);
          sound.volume = alertVolume / 100;
          sound.play().catch(() => {});
          newBuff.hasAlerted = true;
          didChange = true;
          return newBuff;
        }

        // Skip ticking for stack or target debuffs
        if (newBuff.type === 'StackBuff' || newBuff.type === 'TargetDebuff') {
          return newBuff;
        }

        // Tick down timeRemaining only if buff wasn't updated this tick
        const lastUpdate = newBuff.lastUpdated ?? 0;
        const timeSinceUpdate = now - lastUpdate;

        if (
          newBuff.isActive &&
          typeof newBuff.timeRemaining === 'number' &&
          newBuff.timeRemaining >= 1 &&
          timeSinceUpdate > 1000
        ) {
          newBuff.timeRemaining = Math.max(0, newBuff.timeRemaining - 1);
          newBuff.lastUpdated = now;
          didChange = true;
        }

        return newBuff;
      });

      if (didChange) {
        updateGroup(group.id, { buffs: updatedBuffs });
      }
    });
  }, []);

  return tickCooldownTimers;
}