import { useState, useEffect, useRef, useCallback } from 'react';
import ActionbarReader from 'alt1/ability/actionbar';
import { useCombatMonitor } from '../hooks/useCombatMonitor';

type ReaderStatus = "IDLE" | "FINDING ACTION BAR" | "READING" | "ERROR";

interface ActionBarReaderProps {
  debugMode?: boolean;
  readInterval?: number;
  a1lib: any;
}

export function ActionBarReaderComponent({
  debugMode = false,
  a1lib,
  readInterval = 500,
}: ActionBarReaderProps) {
  const [status, setStatus] = useState<ReaderStatus>("IDLE");
  const readerRef = useRef<any | null>(null);
  const intervalRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);

  const checkCombat = useCombatMonitor();

  const readAbilities = useCallback(() => {
    if (readerRef.current) {
      const data = readerRef.current.read();
      if (data && Array.isArray(data)) {
        checkCombat(data);
      }
    }
  }, [checkCombat]);

  useEffect(() => {
    const cleanup = () => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    };

    if (status === "IDLE") {
      setStatus("FINDING ACTION BAR");
    }

    else if (status === "FINDING ACTION BAR") {
      try {
        const reader = new ActionbarReader();
        const found = reader.find();
        if (found) {
          readerRef.current = reader;
          setStatus("READING");
        } else {
            retryTimeoutRef.current = window.setTimeout(() => setStatus("FINDING ACTION BAR"), 3000);
        }
      } catch (e) {
        console.error("Error finding action bar:", e);
        setStatus("ERROR");
      }
    }

    else if (status === "READING") {
      intervalRef.current = window.setInterval(readAbilities, readInterval);
    }

    return cleanup;
  }, [status, readAbilities, readInterval]);

  return (
    debugMode && (
        <>
            <div style={{ padding: '5px', border: '1px solid #555', marginTop: '5px' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Action Bar Reader</p>
            <p style={{ margin: 0, fontSize: '0.9em' }}>Status: {status}</p>
            </div>
            {status === "ERROR" && (
            <div style={{ color: "red" }}>Error finding Action Bar. Please restart overlay.</div>
            )}
        </>
    )
  );
}