import { useEffect } from "react";
import { type ChatLine } from "alt1/chatbox";
import { debugLog } from "../lib/debugLog";
import { alertsMap } from "../data/alerts";
import { playAlertSound } from "../lib/playAlertSound";

export function useChatAlerts(chatLog: ChatLine[]) {
  useEffect(() => {
    if (!chatLog?.length) return;

    chatLog.forEach((line) => {
      const text = line.text.trim();
      const match = alertsMap.find((entry) => text.includes(entry.key));
      if (match) {
        debugLog.success(`Triggering alert for "${match.label}"`, { __tags: ['chat', 'alert'] });
        playAlertSound(match.key, match.filename);
      }
    });
  }, [chatLog]);
}