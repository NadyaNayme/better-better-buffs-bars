import { useRef, useEffect } from "react";
import useStore from "../store";

export function useCombatMonitor() {
  const lastValues = useRef<{ hp: number; adrenaline: number; prayer: number } | null>(null);
  const lastChange = useRef<number>(Date.now());
  const interval = useRef<number | null>(null);
  const lastCheck = useRef<number>(0);

  const checkCombat = (data: any) => {
    const now = Date.now();
    const { hp, adrenaline, prayer } = data;

    if (now - lastCheck.current < 1500) return;
    lastCheck.current = now;

    const current = { hp, adrenaline, prayer };
    const previous = lastValues.current;

    const changed =
      !previous ||
      hp !== previous.hp ||
      adrenaline !== previous.adrenaline ||
      prayer !== previous.prayer;

    if (changed) {
      useStore.getState().setInCombat(true);
      lastChange.current = now;
      lastValues.current = current;
    }
  };

  useEffect(() => {
    interval.current = window.setInterval(() => {
      if (Date.now() - lastChange.current > 3000) {
        useStore.getState().setInCombat(false);
      }
    }, 1000);

    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);

  return checkCombat;
}