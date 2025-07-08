import { useRef, useEffect } from "react";
import useStore from "../store";

export function useCombatMonitor() {
  const setInCombat = useStore(state => state.setInCombat);
  const lastValues = useRef<{ hp: number; adrenaline: number; prayer: number } | null>(null);
  const lastChange = useRef<number>(Date.now());
  const interval = useRef<number | null>(null);

  const checkCombat = (data: any) => {
    const { hp, adrenaline, prayer } = data;

    const current = { hp, adrenaline, prayer };
    const previous = lastValues.current;

    if (!previous || hp !== previous.hp || adrenaline !== previous.adrenaline || prayer !== previous.prayer) {
      setInCombat(true);
      lastChange.current = Date.now();
      lastValues.current = current;
    }
  };

  useEffect(() => {
    interval.current = window.setInterval(() => {
      if (Date.now() - lastChange.current > 3000) {
        setInCombat(false);
      }
    }, 1000);

    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);

  return checkCombat;
}