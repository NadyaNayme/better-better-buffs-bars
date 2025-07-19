import { useCallback, useEffect, useMemo } from 'react';
import useStore from '../../../store';
import { isRuntimeBuff, type ActionMap, type AlertCondition } from '../../../types/Buff';
import { debugLog } from '../../../lib/debugLog';
import { alertsMap } from '../../../data/alerts'; 
import { createStoreMonitor } from '../../../lib/storeMonitor';
import { onTimeRemaining, onStacks, onActive, onInactive, onCooldownEnd } from '../../../lib/store-monitors/alertMonitors';

const conditionToActionMap: ActionMap = {
    onTimeRemaining,
    onStacks,
    onActive,
    onInactive,
    onCooldownEnd,
  };

function isValidAlertCondition(key: any): key is AlertCondition {
    return key in conditionToActionMap;
}

export function GlobalAlertManager() {
    const voice = useStore((state) => state.voice);
    const storeMonitor = useMemo(() => {
        return createStoreMonitor(useStore);
      }, []);

    const setupMonitors = useCallback(() => {    
        const allBuffs = useStore.getState().groups.flatMap(g => [...g.buffs, ...g.children]);
        
        const buffsWithAlerts = allBuffs.filter(buff => 
          isRuntimeBuff(buff) && buff.alert && alertsMap[buff.name]
        );
    
        const allUnsubscribeFunctions: (() => void)[] = [];
    
        for (const buff of buffsWithAlerts) {
          if (!isRuntimeBuff(buff)) continue;
          const alertConfig = buff.alert!;
          const { condition, threshold } = alertConfig;
    
          if (!isValidAlertCondition(condition)) continue;
          
          const handleAlertTrigger = () => {
            const { enableAlerts, alertVolume } = useStore.getState();
            if (!enableAlerts) return;
            
            debugLog.success(`ALERT TRIGGERED for ${buff.name}: Condition ${condition} met.`);
            
            const soundFile = `./assets/audio/${voice}/${alertsMap[buff.name]}`;
            const sound = new Audio(soundFile);
            sound.volume = alertVolume / 100;
            sound.play().catch(err => debugLog.error("Error playing sound:", err));
          };
          
          let unsubscribe;
          
          if (condition === 'onActive' || condition === 'onInactive' || condition === 'onCooldownEnd') {
            const action = conditionToActionMap[condition];
            unsubscribe = action(storeMonitor, buff.name, handleAlertTrigger);
          } else {
            const action = conditionToActionMap[condition];
            unsubscribe = action(storeMonitor, buff.name, threshold, handleAlertTrigger);
          }
          allUnsubscribeFunctions.push(unsubscribe);
        }
        
        return allUnsubscribeFunctions;
      }, [voice, storeMonitor]);

      useEffect(() => {
        let currentUnsubscribers = setupMonitors();
    
        const storeUnsubscribe = useStore.subscribe(
          (state, prevState) => {
            if (state.groups !== prevState.groups) {
              currentUnsubscribers.forEach(unsub => unsub());
              currentUnsubscribers = setupMonitors();
            }
          }
        );
    
        return () => {
          debugLog.info("Tearing down all alert systems.");
          currentUnsubscribers.forEach(unsub => unsub());
          storeUnsubscribe();
          storeMonitor.destroy(); 
        };
    
      }, [setupMonitors, storeMonitor]); 
    
      return null; 
    }