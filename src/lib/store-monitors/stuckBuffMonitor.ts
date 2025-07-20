import { createStoreMonitor } from '../storeMonitor';
import useStore from '../../store';
import { isRuntimeBuff, type BuffInstance } from '../../types/Buff';
import { debugLog } from '../debugLog';
import { throttle } from 'lodash-es';

const CHECK_TIME_MS = 5000;

export function initializeStuckBuffMonitor() {
  const storeMonitor = createStoreMonitor(useStore);
  const buffHistory = new Map<string, { time: number; stuckCount: number }>();
  
  const selector = (state: any): { id: string; name: string; type: string; timeRemaining: number | null }[] => {
    return state.groups
      .flatMap((g: any) => [...g.buffs, ...g.children])
      .filter(isRuntimeBuff)
      .map((b: BuffInstance) => ({
        id: b.id,
        name: b.name,
        type: b.type,
        timeRemaining: b.timeRemaining,
      }));
  };

  const handler = (currentBuffs: ReturnType<typeof selector>) => {
    const buffsToDeactivate = new Set<string>();

    for (const currentBuff of currentBuffs) {
      if (currentBuff.type === "TargetDebuff" || currentBuff.type === "PermanentBuff" || currentBuff.type === "MetaBuff" || currentBuff.type === "StackBuff") continue
      if (typeof currentBuff.timeRemaining !== 'number' || currentBuff.timeRemaining <= 0 || currentBuff.timeRemaining === null) {
        buffHistory.delete(currentBuff.id);
        continue;
      }

      const history = buffHistory.get(currentBuff.id);

      if (!history) {
        buffHistory.set(currentBuff.id, { time: currentBuff.timeRemaining, stuckCount: 1 });
      } else {
        if (currentBuff.timeRemaining === history.time && currentBuff.timeRemaining < 59) {
          const newStuckCount = history.stuckCount + 1;
          
          if (newStuckCount >= 3) {
            debugLog.warning(`Failsafe triggered: Buff "${currentBuff.name}" appears to be stuck at ${currentBuff.timeRemaining}s. Deactivating.`);
            buffsToDeactivate.add(currentBuff.id);
            buffHistory.delete(currentBuff.id);
          } else {
            buffHistory.set(currentBuff.id, { time: currentBuff.timeRemaining, stuckCount: newStuckCount });
          }
        } else {
          buffHistory.set(currentBuff.id, { time: currentBuff.timeRemaining, stuckCount: 1 });
        }
      }
    }

    if (buffsToDeactivate.size > 0) {
      useStore.getState().forceDeactivateBuffs(Array.from(buffsToDeactivate));
    }
  };

  const throttledHandler = throttle(
    handler, 
    CHECK_TIME_MS,
    { 
      leading: true, 
      trailing: false
    }
  );

  storeMonitor.monitor(selector, throttledHandler);

  debugLog.info("Stuck Buff Failsafe Monitor initialized.");
}