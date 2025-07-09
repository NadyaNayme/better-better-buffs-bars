import { useEffect, useRef, useCallback, useReducer, useState } from 'react';
import TargetMobReader from 'alt1/targetmob';
import useStore from '../store';
import a1lib from 'alt1';

import Bloated from '../assets/data/bloated.data.png';
import DeathMark from '../assets/data/Death_Mark.data.png';
import Vulnerability from '../assets/data/Vulnerability_bordered.data.png';
import { debugLog } from '../lib/debugLog';

const enemyDebuffImages = {
  'Bloat': Bloated,
  'Death Mark': DeathMark,
  'Vulnerability': Vulnerability,
};

const initialState = {
  status: 'START',
  error: null,
};

function reducer(state: any, action: {status?: any, error?: any, type: any}) {
  switch (action.type) {
    case 'START':
      return { status: 'LOADING_IMAGES', error: null };
    case 'LOADED_IMAGES':
      return { status: 'FINDING_NAMEPLATE', error: null };
    case 'NAMEPLATE_FOUND':
      return { status: 'READING', error: null };
    case 'ERROR':
      return { status: 'ERROR', error: action.error };
    case 'RESET':
      return { status: 'START', error: null };
    default:
      return state;
  }
}

function getDebuffUpdates({
  imageMap,
  captureRegion,
  lastDetectedRef,
}: {
  imageMap: Map<string, any>;
  captureRegion: any;
  lastDetectedRef: React.RefObject<Record<string, boolean>>;
}): Map<string, { name: string; isActive: boolean; time: number }> {
  const updates = new Map<string, { name: string; isActive: boolean; time: number }>();

  for (const name of Object.keys(enemyDebuffImages)) {
    const image = imageMap.get(name);
    if (!image) continue;

    const isDetected = captureRegion.findSubimage(image).length > 0;
    const previouslyDetected = lastDetectedRef.current[name] ?? false;

    lastDetectedRef.current[name] = isDetected;

    if (isDetected !== previouslyDetected) {
      updates.set(name, {
        name,
        isActive: isDetected,
        time: isDetected ? 3000 : 0,
      });
    }
  }

  return updates;
}

function clearAllDebuffs(lastDetectedRef: any) {
  const cleared = new Map();
  for (const name of Object.keys(enemyDebuffImages)) {
    if (lastDetectedRef.current[name] !== false) {
      lastDetectedRef.current[name] = false;
      cleared.set(name, { name, isActive: false, time: 0 });
    }
  }
  return cleared;
}

export const TargetMobReaderComponent = ({ readInterval = 300, debugMode }: {readInterval: number, debugMode: boolean}) => {
  const [{ status, error }, dispatch] = useReducer(reducer, initialState);
  const {
    lastMobNameplatePos,
    setLastMobNameplatePos,
    syncIdentifiedBuffs,
  } = useStore();

  const [targetData, setTargetData] = useState({ hp: 0, name: 'Not Found' });
  const readerRef = useRef(new TargetMobReader());
  const intervalRef = useRef(0);
  const resolvedImagesRef = useRef(new Map<string, any>);
  const lastDetectedRef = useRef({ Bloat: false, 'Death Mark': false, Vulnerability: false });

  const loadImages = useCallback(async () => {
    dispatch({ type: 'START' });
    try {
      const LOADED_IMAGES = await Promise.all(Object.values(enemyDebuffImages));
      const map: Map<string, any> = new Map();
      Object.keys(enemyDebuffImages).forEach((name, i) => map.set(name, LOADED_IMAGES[i]));
      resolvedImagesRef.current = map;
      dispatch({ type: 'LOADED_IMAGES' });
    } catch (err: any) {
      dispatch({ type: 'ERROR', error: err.message });
    }
  }, []);

  const findTargetPosition = useCallback(() => {
    const result = readerRef.current.read();
    if (result) {
      setTargetData({ hp: result.hp ?? '', name: result.name ?? '' });
      const newPos = readerRef.current.lastpos;
      if (newPos && (!lastMobNameplatePos || newPos.x !== lastMobNameplatePos.x || newPos.y !== lastMobNameplatePos.y)) {
        setLastMobNameplatePos(newPos);
      }
      dispatch({ type: 'NAMEPLATE_FOUND' });
    }
  }, [setLastMobNameplatePos]);

  const readTarget = useCallback(() => {
    const result = readerRef.current.read();
    if (result) {
      setTargetData({ hp: result.hp ?? '', name: result.name ?? '' });
      const newPos = readerRef.current.lastpos;
      if (newPos && (!lastMobNameplatePos || newPos.x !== lastMobNameplatePos.x || newPos.y !== lastMobNameplatePos.y)) {
        setLastMobNameplatePos(newPos);
      }
    }
    const pos = readerRef.current.lastpos ?? lastMobNameplatePos;
    if (pos && resolvedImagesRef.current) {
      const region = a1lib.captureHold(pos.x - 120, pos.y + 20, 150, 60);
      const updates = getDebuffUpdates({ imageMap: resolvedImagesRef.current, captureRegion: region, lastDetectedRef });
      if (updates.size > 0) syncIdentifiedBuffs(updates);
    } else {
      const cleared = clearAllDebuffs(lastDetectedRef);
      if (cleared.size > 0) syncIdentifiedBuffs(cleared);
    }
  }, [lastMobNameplatePos, setLastMobNameplatePos, syncIdentifiedBuffs]);

  useEffect(() => {
    if (status === 'START') {
      loadImages();
    }
    if (status === 'FINDING_NAMEPLATE') {
      const interval = setInterval(() => findTargetPosition(), 2000);
      return () => clearInterval(interval);
    }
    if (status === 'READING' && intervalRef.current === 0) {
      debugLog('[Target Mob Reader] Starting read interval...')
      intervalRef.current = setInterval(readTarget, readInterval);
      return () => clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current !== 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = 0;
        debugLog('[Target Mob Reader] Clearing read interval.');
      }
    };
  }, [status, loadImages, findTargetPosition, readTarget, readInterval]);

  const handleScanClick = () => {
    setLastMobNameplatePos(null);
    dispatch({ type: 'LOADED_IMAGES' });
    const cleared = clearAllDebuffs(lastDetectedRef);
    if (cleared.size > 0) {
      syncIdentifiedBuffs(cleared);
      debugLog(`[Target Mob Reader] Force clearing enemy debuffs.`)
    }
  };

  return (
    <div>
      <button onClick={handleScanClick}>🔍 Scan for Nameplate</button>
      {debugMode && (
        <>
          <div>Status: {status}</div>
          <div>Name: {targetData.name}</div>
          <div>HP: {targetData.hp}</div>
          <div>Pos: {lastMobNameplatePos ? `(${lastMobNameplatePos.x}, ${lastMobNameplatePos.y})` : 'N/A'}</div>
          {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        </>
      )}
    </div>
  );
};