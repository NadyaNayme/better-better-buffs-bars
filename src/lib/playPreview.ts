import { debugLog } from './debugLog';

export function playPreview(filename: string, voice: string, alertVolume: number) {
  const audio = new Audio(`./assets/audio/${voice}/${filename}`);
  audio.volume = (alertVolume ?? 80) / 100;
  audio.play().catch((e) => {
    debugLog.error(`Couldn't play sample audio`, e);
  });
}