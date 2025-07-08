import { useRef, useEffect, useCallback } from "react";
import useStore from "../store";

export function useCombatMonitor() {
  const lastValues = useRef<{ hp: number; dren: number; pray: number } | null>(null);
  const lastChange = useRef<number>(Date.now());
  const interval = useRef<number | null>(null);
  const lastCheck = useRef<number>(0);

  const checkCombat = useCallback((data: any) => {
    const now = Date.now();
    const { hp, dren, pray } = data;

    if (now - lastCheck.current < 500) return;
    lastCheck.current = now;

    const current = { hp, dren, pray };
    const previous = lastValues.current;

    const changed =
      !previous ||
      hp !== previous.hp ||
      dren !== previous.dren ||
      pray !== previous.pray;

    if (changed) {
      useStore.getState().setInCombat(true);
      lastChange.current = now;
      lastValues.current = current;
    }
  }, []);

  useEffect(() => {
    interval.current = window.setInterval(() => {
      if (Date.now() - lastChange.current > 2500) {
        useStore.getState().setInCombat(false);
      }
    }, 500);

    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);

  return checkCombat;
}