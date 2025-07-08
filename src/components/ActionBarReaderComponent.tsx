import { useState, useEffect, useRef, useCallback } from 'react';
import ActionbarReader from 'alt1/ability';
import { useCombatMonitor } from '../hooks/useCombatMonitor';
import { alertsMap } from '../lib/alerts';
import useStore from '../store';

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
  const [lifeData, setLifeData] = useState<{ hp: number; adrenaline: number; prayer: number } | null>(null);
  const readerRef = useRef<any | null>(null);
  const intervalRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const lastRunRef = useRef(0);
  const isReadingRef = useRef(false);
  const hasPotted = useRef(false);
  const alertVolume = useStore.getState().alertVolume;

  const checkCombat = useCombatMonitor();

  const readAbilities = useCallback(async () => {
    if (isReadingRef.current) {
        return;
    }
    const now = Date.now();
    if (now - lastRunRef.current < 500) return;
    lastRunRef.current = now;
  
    const bounds = readerRef.current.bars?.[0]?.bounds;
    if (!bounds) return;

    const { x, y, width, height } = bounds;

    try {
    isReadingRef.current = true;
    const captureRegion = a1lib.capture(x, y, width, height);
    const data: {hp: number, dren: number, pray: number } = readerRef.current.actionbarReader.read(captureRegion, x, y);

    if (data) {
        checkCombat(data);
        setLifeData({
            hp: data.hp ?? 0,
            adrenaline: data.dren ?? 0,
            prayer: data.pray ?? 0,
        });
        if (data.pray === 0 && !hasPotted.current) {
            const sound = new Audio(alertsMap['Prayer (Empty)']);
            sound.volume = alertVolume / 100;
            sound.play().catch(() => {});
            hasPotted.current = true;
        } else if (data.pray <= 0.30 && !hasPotted.current) {
            const sound = new Audio(alertsMap['Prayer (Low)']);
            sound.volume = alertVolume / 100;
            sound.play().catch(() => {});
            hasPotted.current = true;
        } else if (data.pray >= 0.50 && hasPotted) {
            hasPotted.current = false;
        }
    }
    } catch (e) {
    console.error('readAbilities failed:', e);
    } finally {
        isReadingRef.current = false;
    }
}, [a1lib, checkCombat]);

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

    else if (status === "READING" && intervalRef.current === null && readerRef.current) {
        console.log('[Actionbar Reader] Starting read interval...');
        intervalRef.current = setInterval(() => {
            readAbilities();
        }, readInterval);
    }

    return cleanup;
  }, [status, readInterval, a1lib, readAbilities]);

  return (
    debugMode && (
      <>
        <div style={{ padding: '5px', border: '1px solid #555', marginTop: '5px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Action Bar Reader</p>
          <p style={{ margin: 0, fontSize: '0.9em' }}>Status: {status}</p>
        </div>
        {status === "READING" && lifeData && (
            <div style={{ marginTop: '5px', fontSize: '0.9em', borderTop: '1px solid #444', paddingTop: '5px' }}>
              <p style={{ margin: 0 }}>HP: {lifeData.hp}</p>
              <p style={{ margin: 0 }}>Adrenaline: {lifeData.adrenaline}</p>
              <p style={{ margin: 0 }}>Prayer: {lifeData.prayer}</p>
            </div>
          )}
        {status === "ERROR" && (
          <div style={{ color: "red" }}>Error finding Action Bar. Please restart overlay.</div>
        )}
      </>
    )
  );
}