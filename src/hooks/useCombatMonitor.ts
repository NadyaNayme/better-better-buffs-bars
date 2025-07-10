import { useCallback, useEffect } from "react";
import useStore from "../store/index";

let isMonitoring = false;
let globalInterval: number | null = null;
let globalLastChange = Date.now();
let globalLastValues: { hp: number; dren: number; pray: number } | null = null;
let globalLastCheck = 0;

export function useCombatMonitor() {
  const checkCombat = useCallback((data: any) => {
    const now = Date.now();
    const { hp, dren, pray } = data;

    if (now - globalLastCheck < 500) return;
    globalLastCheck = now;

    const previous = globalLastValues;
    const changed =
      !previous || hp !== previous.hp || dren !== previous.dren || pray !== previous.pray;

    if (changed) {
      useStore.getState().setInCombat(true);
      globalLastChange = now;
      globalLastValues = { hp, dren, pray };
    }
  }, []);

  useEffect(() => {
    if (isMonitoring) return;

    isMonitoring = true;
    globalInterval = window.setInterval(() => {
      if (Date.now() - globalLastChange > 3500) {
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