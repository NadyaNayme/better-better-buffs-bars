import useStore from "../store";

const lastPlayedMap: Record<string, number> = {};
const COOLDOWN_MS = 3000;

export function playAlertSound(alert: string, filename: string) {
  const now = Date.now();

  const enabledAlerts = useStore.getState().alertEnabledMap;
  if (enabledAlerts[alert] === false) return;

  if (lastPlayedMap[alert] && now - lastPlayedMap[alert] < COOLDOWN_MS) return;
  lastPlayedMap[alert] = now;

  const alertVolume = useStore.getState().alertVolume;
  const voice = useStore.getState().voice;

  const audio = new Audio(`./assets/audio/${voice}/${filename}`);
  audio.volume = alertVolume / 100;
  audio.play().catch((err) => {
    console.error("Failed to play alert sound:", err);
  });
}