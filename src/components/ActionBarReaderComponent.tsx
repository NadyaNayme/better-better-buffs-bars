import { useState, useEffect, useRef, useCallback } from 'react';
import ActionbarReader from 'alt1/ability';
import { useCombatMonitor } from '../hooks/useCombatMonitor';

type ReaderStatus = "IDLE" | "FINDING ACTION BAR" | "READING" | "ERROR";

interface ActionBarReaderProps {
  debugMode?: boolean;
  readInterval?: number;
  onCombatCheck: (inCombat: boolean) => void;
  a1lib: any;
}

export function ActionBarReaderComponent({
  debugMode = false,
  a1lib,
  onCombatCheck,
  readInterval = 2500,
}: ActionBarReaderProps) {
  const [status, setStatus] = useState<ReaderStatus>("IDLE");
  const [lifeData, setLifeData] = useState<{ hp: number; adrenaline: number; prayer: number } | null>(null);
  const readerRef = useRef<any | null>(null);
  const intervalRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);

  const checkCombat = useCombatMonitor();

  const readAbilities = useCallback(() => {
    console.log('Read Abilities callback called');
    if (readerRef.current) {
      const { x, y, width, height } = readerRef.current;
      const captureRegion = a1lib.getRegion(x, y, width, height);
      const data = readerRef.current.readLife(captureRegion, captureRegion.width, captureRegion.height);
      console.log(data);
      if (data) {
        checkCombat(data);
        setLifeData({
            hp: data.hp ?? 0,
            adrenaline: data.adrenaline ?? 0,
            prayer: data.prayer ?? 0,
          });
      }
    }
  }, [checkCombat, setLifeData]);

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
      setStatus("FINDING ACTION BAR");
    }

    else if (status === "FINDING ACTION BAR") {
      console.log('Attempting to find Actionbar');
      try {
        const reader = new ActionbarReader(a1lib.captureHoldFullRs());
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
        console.log('[Actionbar Reader] Starting read interval...');
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
          {lifeData && (
            <div style={{ fontSize: '0.9em', marginTop: '4px' }}>
              <p style={{ margin: 0 }}>HP: {lifeData.hp}</p>
              <p style={{ margin: 0 }}>Adrenaline: {lifeData.adrenaline}</p>
              <p style={{ margin: 0 }}>Prayer: {lifeData.prayer}</p>
            </div>
          )}
        </div>
        {status === "ERROR" && (
          <div style={{ color: "red" }}>Error finding Action Bar. Please restart overlay.</div>
        )}
      </>
    )
  );
}