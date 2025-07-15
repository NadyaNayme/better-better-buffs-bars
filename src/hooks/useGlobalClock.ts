import { useEffect, useState } from 'react';

export function useGlobalClock() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((n) => n + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return tick;
}