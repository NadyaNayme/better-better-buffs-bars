import { useEffect } from 'react';
import useStore from '../store/';
import { alertsMap } from '../data/alerts';
import { isRuntimeBuff, type AlertCondition, type BuffInstance } from '../types/Buff';

export function useAlerts() {
  const groups = useStore((state) => state.groups);
  const voice = useStore((state) => state.voice); 
  const alertVolume = useStore((state) => state.alertVolume);
  const alertEnabledMap = useStore((state) => state.alertEnabledMap);
  const updateBuffAlertState = useStore((state) => state.updateBuffAlertState);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      for (const group of groups) {
        for (const buff of [...group.buffs, ...group.children]) {
          if (!isRuntimeBuff(buff) || !buff?.alert || !buff.alert.condition) { 
            continue;
          }
          const { condition, threshold, hasAlerted } = buff.alert;
          const shouldPlay = checkCondition(buff, condition, threshold, now);

          if (shouldPlay && !hasAlerted) {
            const audioFile = alertsMap[buff.name];
            if (audioFile && alertEnabledMap[buff.name] !== false) {
              const audio = new Audio(`/assets/audio/${voice}/${audioFile}`);
              audio.volume = alertVolume / 100;
              audio.play().catch(() => {});
            }
            updateBuffAlertState(buff.name, true);
          } else if (!shouldPlay && hasAlerted) {
            updateBuffAlertState(buff.name, false);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [groups, alertEnabledMap, voice]);
}

function checkCondition(
  buff: BuffInstance,
  condition: AlertCondition,
  threshold: number,
  now: number
): boolean {
  switch (condition) {
    case 'timeRemaining':
      return typeof buff.timeRemaining === 'number' && buff.timeRemaining > 0 && buff.timeRemaining <= threshold;

    case 'stacks':
      return typeof buff.stacks === 'number' && buff.stacks === threshold;

    case 'onCooldownEnd':
      return typeof buff.cooldownStart === 'number' && now - buff.cooldownStart < 4000;

      case 'onActive':
        return buff.status === 'Active' &&
          typeof buff.statusChangedAt === 'number' &&
          now - buff.statusChangedAt < 4000;
      
      case 'onInactive':
        return buff.status === 'Inactive' &&
          typeof buff.statusChangedAt === 'number' &&
          now - buff.statusChangedAt < 4000;

    default:
      return false;
  }
}