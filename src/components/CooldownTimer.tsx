import { useEffect } from 'react';
import useStore from '../store';

export function CooldownTimer() {
  const tickCooldownTimers = useStore(state => state.tickCooldownTimers);

  useEffect(() => {
    const intervalId = setInterval(() => {
        tickCooldownTimers();
    }, 1000); // 1 second
    return () => clearInterval(intervalId);
  }, [tickCooldownTimers]);

  return null;
}