import useStore from "../store";

const lastPlayedMap: Record<string, number> = {};
const COOLDOWN_MS = 3000;

type QueuedAlert = { alert: string; filename: string };

const alertQueue: QueuedAlert[] = [];
let isPlaying = false;

function playNextInQueue() {
  if (isPlaying || alertQueue.length === 0) return;

  const next = alertQueue.shift();
  if (!next) return;

  const now = Date.now();
  const { alert, filename } = next;

  if (lastPlayedMap[alert] && now - lastPlayedMap[alert] < COOLDOWN_MS) {
    return playNextInQueue();
  }

  lastPlayedMap[alert] = now;

  const { alertEnabledMap, alertVolume, voice } = useStore.getState();
  if (alertEnabledMap[alert] === false) {
    return playNextInQueue();
  }

  const audio = new Audio(`./assets/audio/${voice}/${filename}`);
  audio.volume = alertVolume / 100;
  isPlaying = true;

  audio.play().catch((err) => {
    console.error("Failed to play alert sound:", err);
    isPlaying = false;
    playNextInQueue();
  });

  audio.addEventListener("ended", () => {
    isPlaying = false;
    playNextInQueue();
  });
}

export function playAlertSound(alert: string, filename: string) {
  alertQueue.push({ alert, filename });
  playNextInQueue();
}