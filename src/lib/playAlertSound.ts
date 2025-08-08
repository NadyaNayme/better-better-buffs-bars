import useStore from "../store";
import { debugLog } from "./debugLog";

const lastPlayedMap: Record<string, number> = {};
const COOLDOWN_MS = 3000;

type QueuedAlert = { alert: string; filename: string };

const alertQueue: QueuedAlert[] = [];
let isPlaying = false;

async function playNextInQueue() {
  if (isPlaying || alertQueue.length === 0) return;

  const next = alertQueue.shift();
  if (!next) return;

  const now = Date.now();
  const { alert, filename } = next;

  if (lastPlayedMap[alert] && now - lastPlayedMap[alert] < COOLDOWN_MS) {
    return playNextInQueue();
  }

  lastPlayedMap[alert] = now;

  const { alerts, alertVolume, voice } = useStore.getState();
  if (alerts[alert] === false) {
    return playNextInQueue();
  }

  const audio = new Audio(`./assets/audio/${voice}/${filename}`);
  audio.volume = alertVolume / 100;
  isPlaying = true;

  await audio.play().catch((err) => {
    console.error("Failed to play alert sound:", err);
    isPlaying = false;
    playNextInQueue();
  });

  debugLog.info(`Triggered alert for ${alerts[alert]}`);

  audio.addEventListener("ended", () => {
    isPlaying = false;
    playNextInQueue();
  });
}

export function playAlertSound(alert: string, filename: string) {
  alertQueue.push({ alert, filename });
  playNextInQueue();
}