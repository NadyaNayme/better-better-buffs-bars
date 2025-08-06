import { useCallback, useEffect } from "react";
import useStore from "../store/index";
import { debugLog } from "../lib/debugLog";
import { alertsMap } from "../data/alerts";

let isMonitoring = false;
let globalInterval: number | null = null;
let globalLastChange = Date.now();
let globalLastValues: { hp: number; dren: number; pray: number } | null = null;
let globalLastCheck = 0;
const MAX_CHANGE = .25;
let hasPotted = false;
let hasRanOutOfPrayer = false;


export function useCombatMonitor() {
  const alertVolume = useStore.getState().alertVolume;
  const enabledAlerts = useStore.getState().alertEnabledMap;
  const isInCombat = useStore.getState().inCombat;
  const voice = useStore.getState().voice;
  const checkCombat = useCallback((data: { hp: number; dren: number; pray: number }) => {
    const now = Date.now();
    const { hp, dren, pray } = data;

    if (now - globalLastCheck < 500) return;
    globalLastCheck = now;

    const previous = globalLastValues;
    const changed =
      !previous || hp !== previous.hp || dren !== previous.dren || pray !== previous.pray;

    // === Prayer read validation ===
    if (previous) {
      const prevPrayer = previous.pray;
      const delta = prevPrayer - pray;

      if (delta > 0) {
        debugLog.info(`Prayer change rate:`, delta);
        // Hard cap: any drop > 300 is invalid
        if (delta > MAX_CHANGE) {
          debugLog.error(`Discarded invalid prayer read: dropped by ${delta} (>300)`);
          return;
        }
        if (data.pray === 0 && !hasRanOutOfPrayer && isInCombat && enabledAlerts['Prayer (Empty)']) {
          const alert = alertsMap.find(a => a.key === 'Prayer (Empty)');
          if (alert) {
            const sound = new Audio(`./assets/audio/${voice}/${alert.filename}`);
            sound.volume = alertVolume / 100;
            sound.play().catch(() => {});
            hasRanOutOfPrayer = true;
          }
      } else if (data.pray <= 0.30 && !hasPotted && isInCombat && enabledAlerts['Prayer (Low)']) {
          const alert = alertsMap.find(a => a.key === 'Prayer (Low)');
          if (alert) {
            const sound = new Audio(`./assets/audio/${voice}/${alert.filename}`);
            sound.volume = alertVolume / 100;
            sound.play().catch(() => {});
            hasPotted = true;
          }
      } else if (data.pray >= 0.31 && (hasPotted || hasRanOutOfPrayer)) {
          hasPotted = false;
          hasRanOutOfPrayer = false;
      }
      }
    }

    // === Normal update flow ===
    if (changed) {
      globalLastChange = now;
      globalLastValues = { hp, dren, pray };

      const inCombat = useStore.getState().inCombat;
      if (!inCombat) {
        debugLog.info("User has entered combat.");
        useStore.getState().setInCombat(true);
      }

      debugLog.verbose(`HP: ${hp} | Adrenaline: ${dren} | Prayer: ${pray}`);
    }
  }, []);

  useEffect(() => {
    if (isMonitoring) return;

    isMonitoring = true;

    globalInterval = window.setInterval(() => {
      const now = Date.now();
      const inCombat = useStore.getState().inCombat;

      // Leave combat if no change has happened for 5 seconds
      if (inCombat && now - globalLastChange > 5000) {
        debugLog.info("User has left combat.");
        useStore.getState().setInCombat(false);
      }
    }, 500);

    return () => {
      if (globalInterval !== null) {
        clearInterval(globalInterval);
        globalInterval = null;
        isMonitoring = false;
      }
    };
  }, []);

  return checkCombat;
}