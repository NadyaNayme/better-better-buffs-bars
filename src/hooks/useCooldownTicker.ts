import { useCallback, useRef } from 'react';
import useStore from '../store';
import { alertsMap } from '../data/alerts';
import { isRuntimeBuff } from '../types/Buff';
import { debugLog } from '../lib/debugLog';

export function useCooldownTicker() {
  const lastRunRef = useRef(0);

  const tickCooldownTimers = useCallback(() => {
    const now = Date.now();
    // Throttle the entire process to run at most once per second
    if (now - lastRunRef.current < 1000) return;
    lastRunRef.current = now;

    const { groups, enableAlerts, alertVolume, updateGroup } = useStore.getState();

    groups.forEach((group) => {
      let didChange = false;

      const updatedBuffs = group.buffs.map((buff) => {
        if (!isRuntimeBuff(buff)) return buff;
        const newBuff = { ...buff };

        // Handle alert
        if (newBuff.timeRemaining && newBuff.alert &&
          newBuff.timeRemaining <= (newBuff.alert?.threshold ?? 0) &&
          !newBuff.alert.hasAlerted &&
          alertsMap[newBuff.name] &&
          enableAlerts
        ) {
          const sound = new Audio(alertsMap[newBuff.name]);
          sound.volume = alertVolume / 100;
          sound.play().catch(() => {});
          newBuff.alert.hasAlerted = true;
          didChange = true;
        }

        // Skip ticking for stack or target debuffs
        if (newBuff.type === 'StackBuff' || newBuff.type === 'TargetDebuff') {
          return newBuff;
        }

        // Tick down timeRemaining only if buff wasn't updated this tick
        const lastUpdate = newBuff.lastUpdated ?? 0;
        const timeSinceUpdate = now - lastUpdate;

        if (
          newBuff.status === "Active" &&
          typeof newBuff.timeRemaining === 'number' &&
          newBuff.timeRemaining >= 0 &&
          newBuff.timeRemaining <= 59 &&
          newBuff.cooldownStart !== 0 &&
          timeSinceUpdate > 1050 &&
          newBuff.name !== "Blank"
        ) {
          debugLog.info(`Force ticking down time remaining for ${newBuff.name}`);
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