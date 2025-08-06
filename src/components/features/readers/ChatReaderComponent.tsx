import { useCallback, useEffect, useRef, useState } from "react";
import ChatBoxReader, { type ChatLine } from "alt1/chatbox";
import { debugLog } from "../../../lib/debugLog";

type ReaderStatus = "IDLE" | "FINDING CHAT" | "READING" | "ERROR";

interface ActionBarReaderProps {
  debugMode?: boolean;
  readInterval?: number;
  a1lib: any;
}

export function ChatReaderComponent({
  debugMode = false,
  a1lib,
  readInterval = 300,
}: ActionBarReaderProps) {
  const [status, setStatus] = useState<ReaderStatus>("IDLE");
  const readerRef = useRef<any | null>(null);
  const intervalRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const lastRunRef = useRef(0);
  const isReadingRef = useRef(false);
  const [chatLog, setChatLog] = useState<ChatLine[]>([]);

  const timeStampColor = a1lib.mixColor(127,169,255);
  const whiteColor = a1lib.mixColor(224, 220, 219);
  const yellowColor = a1lib.mixColor(255,255,0);
  const darkRedColor = a1lib.mixColor(235,47,47);
  const redColor = a1lib.mixColor(255, 0, 0);
  const blueColor = a1lib.mixColor(5, 103, 174);
  const purpleColor = a1lib.mixColor(112, 53, 218);
  const orangeColor = a1lib.mixColor(255,140,56);
  const goldColor = a1lib.mixColor(248, 181, 23);
  const greenColor = a1lib.mixColor(107, 165, 48);

  const readChat = useCallback(async () => {
    if (isReadingRef.current) {
        return;
    }
    const now = Date.now();
    if (now - lastRunRef.current < 500) return;
    lastRunRef.current = now;
  

    try {
    isReadingRef.current = true;
    const readChat = readerRef.current.read()

    if (readChat && readChat.length > 0) {
        setChatLog(readChat)
        console.log(chatLog);
    }
    } catch (e) {
    console.error('[ChatBox Reader] Reading chat failed:', e);
    } finally {
        isReadingRef.current = false;
    }
}, [a1lib]);

  useEffect(() => {
    const cleanup = () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

    if (status === "IDLE") {
      setStatus("FINDING CHAT");
    }

    else if (status === "FINDING CHAT") {
      debugLog.info('[ChatBox Reader] Attempting to find ChatBox');
      try {
        const reader = new ChatBoxReader();
        reader.readargs = {
            colors: [
                whiteColor,
                redColor,
                blueColor,
                purpleColor,
                goldColor,
                greenColor,
                yellowColor,
                darkRedColor,
                orangeColor,
                timeStampColor,
            ]
        }
        const found = reader.find();
        if (found) {
          readerRef.current = reader;
          setStatus("READING");
        } else {
            retryTimeoutRef.current = window.setTimeout(() => setStatus("FINDING CHAT"), 3000);
        }
      } catch (e) {
        debugLog.error("[ChatBox Reader] Error finding chat:", e);
        setStatus("ERROR");
      }
    }

    else if (status === "READING" && intervalRef.current === null && readerRef.current) {
        debugLog.info('[ChatBox Reader] Starting read interval...');
        intervalRef.current = setInterval(() => {
            readChat();
        }, readInterval);
    }

    return cleanup;
  }, [status, readInterval, a1lib, readChat]);

  return (
    debugMode && (
      <>
        <div style={{ padding: '5px', border: '1px solid #555', marginTop: '5px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>ChatBox Reader</p>
          <p style={{ margin: 0, fontSize: '0.9em' }}>Status: {status}</p>
        </div>
        {status === "READING" && chatLog && (
            <div style={{ marginTop: '5px', fontSize: '0.9em', borderTop: '1px solid #444', paddingTop: '5px' }}>
                {chatLog.map((line: ChatLine, index: number) => (
                    <p key={index}>{line.text}</p>
                ))}
            </div>
          )}
        {status === "ERROR" && (
          <div style={{ color: "red" }}>Error finding ChatBox. Please restart overlay.</div>
        )}
      </>
    )
  );
}