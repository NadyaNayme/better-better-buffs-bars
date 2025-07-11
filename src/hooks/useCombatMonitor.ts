import { useCallback, useEffect } from "react";
import useStore from "../store/index";
import { debugLog } from "../lib/debugLog";

let isMonitoring = false;
let globalInterval: number | null = null;
let globalLastChange = Date.now();
let globalLastValues: { hp: number; dren: number; pray: number } | null = null;
let globalLastCheck = 0;

export function useCombatMonitor() {
  const checkCombat = useCallback((data: {hp: number, dren: number, pray: number}) => {
    const now = Date.now();
    const { hp, dren, pray } = data;

    if (now - globalLastCheck < 500) return;
    globalLastCheck = now;

    const previous = globalLastValues;
    const changed =
      !previous || hp !== previous.hp || dren !== previous.dren || pray !== previous.pray;

    if (changed) {
      globalLastChange = now;
      globalLastValues = { hp, dren, pray };

      const inCombat = useStore.getState().inCombat;
      if (!inCombat) {
        debugLog.info("User has entered combat.");
        useStore.getState().setInCombat(true);
      }
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