import { useEffect } from 'react';
import { useCooldownTicker } from '../../../hooks/useCooldownTicker';

export function CooldownTimer() {
  const tickCooldownTimers = useCooldownTicker();

  useEffect(() => {
    const intervalId = setInterval(() => {
      tickCooldownTimers();
    }, 50);
    return () => clearInterval(intervalId);
  }, [tickCooldownTimers]);

  return null;
}