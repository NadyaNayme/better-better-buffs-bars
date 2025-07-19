
import type { Store } from "../../types/Store";
import type { BuffInstance } from "../../types/Buff";

function getBuffByName(state: Store, name: string): BuffInstance | undefined {
  const allBuffs = state.groups.flatMap(g => [...g.buffs, ...g.children]) as BuffInstance[]; // This is safe to do because Groups can only contain BuffInstances ; despite Buffs[] being the Group type. I gotta sort that out.
  return allBuffs.find(b => b.name === name);
}

export function onTimeRemaining(monitor: any, buffName: string, seconds: number, callback: () => void) {
    const selector = (state: Store) => {
      const buff = getBuffByName(state, buffName);
      if (!buff) return null;
      // The selector now returns an object with all the data we need.
      return {
        timeRemaining: buff.timeRemaining,
        hasAlerted: buff.alert?.hasAlerted,
        status: buff.status
      };
    };
  
    const handler = (current: BuffInstance, previous: BuffInstance) => {
      if (!current || !previous) return;
      const alertConditionMet = current.timeRemaining === seconds && !current.alert?.hasAlerted;
      const justHitThreshold = current.timeRemaining !== previous.timeRemaining;
  
      if (alertConditionMet && justHitThreshold) {
        callback();
      }
      
      if (current.status === 'Inactive' && previous.status === 'Active') {
        // This is an advanced concept. You'd need a store action here.
        // useStore.getState().resetAlertStatus(buffName);
      }
    };
  
    return monitor.monitor(selector, handler);
  }

export function onStacks(monitor: any, buffName: string, stacks: number, callback: () => void) {
  return monitor.monitor(
    state => getBuffByName(state, buffName)?.stacks,
    (current, previous) => {
      if (current === stacks && previous !== stacks) {
        callback();
      }
    }
  );
}

export function onActive(monitor: any, buffName: string, callback: () => void) {
  return monitor.monitor(
    state => getBuffByName(state, buffName)?.status,
    (current, previous) => {
      if (current === 'Active' && previous !== 'Active') {
        callback();
      }
    }
  );
}

export function onInactive(monitor: any, buffName: string, callback: () => void) {
    return monitor.monitor(
      state => getBuffByName(state, buffName)?.status,
      (current, previous) => {
        if (current === 'Inactive' && previous !== 'Inactive') {
          callback();
        }
      }
    );
  }

  export function onCooldownEnd(monitor: any, buffName: string, callback: () => void) {
    return monitor.monitor(
        state => getBuffByName(state, buffName)?.status,
        (current, previous) => {
          if (current === 'Inactive' && previous === 'OnCooldown') {
            callback();
          }
        }
      );
  }
