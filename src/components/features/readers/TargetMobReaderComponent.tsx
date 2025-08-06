import { useEffect, useRef, useCallback, useReducer, useState } from 'react';
import TargetMobReader from 'alt1/targetmob';
import useStore from '../../../store/index';

import Bloated from '../../../data/images/bloated.data.png';
import DeathMark from '../../../data/images/Death_Mark.data.png';
import Haunted from '../../../data/images/Haunted.data.png';
import Obliterate from '../../../data/images/Obliterate.data.png'
import SmokeCloud from '../../../data/images/smoke_cloud.data.png';
import Vulnerability from '../../../data/images/Vulnerability_bordered.data.png';
import { debugLog } from '../../../lib/debugLog';

const enemyDebuffImages = {
  'Bloat': Bloated,
  'Death Mark': DeathMark,
  'Haunted': Haunted,
  'Obliterate': Obliterate,
  'Vulnerability': Vulnerability,
  'Smoke Cloud': SmokeCloud,
};

const initialState = {
  status: 'START',
  error: null,
};

function reducer(state: any, action: {status?: any, error?: any, type: any}) {
  switch (action.type) {
    case 'START':
      return { status: 'LOADING IMAGES', error: null };
    case 'LOADED IMAGES':
      return { status: 'FINDING NAMEPLATE', error: null };
    case 'NAMEPLATE FOUND':
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
}): Map<string, { name: string; status: string; time: number }> {
  const updates = new Map<string, { name: string; status: string; time: number }>();

  for (const name of Object.keys(enemyDebuffImages)) {
    const image = imageMap.get(name);
    if (!image) continue;

    const isDetected = captureRegion.findSubimage(image).length > 0;
    const previouslyDetected = lastDetectedRef.current[name] ?? false;

    lastDetectedRef.current[name] = isDetected;

    if (isDetected !== previouslyDetected) {
      updates.set(name, {
        name,
        status: isDetected ? "Active" : "Inactive",
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
      cleared.set(name, { name, status: "Inactive", time: 0 });
    }
  }
  return cleared;
}

export const TargetMobReaderComponent = ({ readInterval = 100, debugMode, a1lib }: {readInterval: number, debugMode: boolean, a1lib: any}) => {
  const [{ status, error }, dispatch] = useReducer(reducer, initialState);
  const {
    lastMobNameplatePos,
    setLastMobNameplatePos,
    syncIdentifiedBuffs,
    setCurrentTarget,
    setCurrentTargetHitpoints,
    setHasTarget,
  } = useStore();

  const [targetData, setTargetData] = useState({ hp: 0, name: 'Not Found' });
  const readerRef = useRef(new TargetMobReader());
  const intervalRef = useRef(0);
  const resolvedImagesRef = useRef(new Map<string, any>);
  const lastDetectedRef = useRef({ Bloat: false, 'Death Mark': false, Vulnerability: false });

  const loadImages = useCallback(async () => {
    try {
      const LOADED_IMAGES = await Promise.all(Object.values(enemyDebuffImages));
      const map: Map<string, any> = new Map();
      Object.keys(enemyDebuffImages).forEach((name, i) => map.set(name, LOADED_IMAGES[i]));
      resolvedImagesRef.current = map;
      dispatch({ type: 'LOADED IMAGES' });
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
        setCurrentTarget(result.name);
        setCurrentTargetHitpoints(result.hp);
        setHasTarget(true);
      }
      dispatch({ type: 'NAMEPLATE FOUND' });
    }
  }, [setLastMobNameplatePos]);

  const readTarget = useCallback(() => {
    const result = readerRef.current.read();
    if (result) {
      setTargetData({ hp: result.hp ?? '', name: result.name ?? '' });
      const newPos = readerRef.current.lastpos;
      if (newPos && (!lastMobNameplatePos || newPos.x !== lastMobNameplatePos.x || newPos.y !== lastMobNameplatePos.y)) {
        setLastMobNameplatePos(newPos);
        setCurrentTarget(result.name);
        setCurrentTargetHitpoints(result.hp);
        setHasTarget(true);
      }
    } else {
      setTargetData({ hp: 0, name: 'Not Found' });
      if (lastMobNameplatePos !== null) {
        setLastMobNameplatePos(null);
        setCurrentTarget(null);
        setCurrentTargetHitpoints(null);
        setHasTarget(false);
      }
    }
    const pos = readerRef.current.lastpos ?? lastMobNameplatePos;
    if (pos && resolvedImagesRef.current) {
      const region = a1lib.captureHold(pos.x - 120, pos.y + 20, 150, 60);
      const updates = getDebuffUpdates({ imageMap: resolvedImagesRef.current, captureRegion: region, lastDetectedRef });
      if (updates.size > 0) syncIdentifiedBuffs(updates);
    } else {
      setTargetData({ hp: 0, name: 'Not Found' });
      if (lastMobNameplatePos !== null) {
        setLastMobNameplatePos(null);
        setCurrentTarget(null);
        setCurrentTargetHitpoints(null);
        setHasTarget(false);
      }
      const cleared = clearAllDebuffs(lastDetectedRef);
      if (cleared.size > 0) syncIdentifiedBuffs(cleared);
    }
  }, [lastMobNameplatePos, setLastMobNameplatePos, syncIdentifiedBuffs]);

  // START → load images
  useEffect(() => {
    if (status === 'START') loadImages();
  }, [status, loadImages]);

  // FINDING NAMEPLATE → start polling for nameplate
  useEffect(() => {
    if (status !== 'FINDING NAMEPLATE') return;
    const id = setInterval(findTargetPosition, 2000);
    return () => clearInterval(id);
  }, [status, findTargetPosition]);

  // READING → start interval for reading debuffs
  useEffect(() => {
    if (status !== 'READING') return;
    debugLog.info('[Target Mob Reader] Starting read interval...');
    const id = setInterval(readTarget, readInterval);
    intervalRef.current = id;
    return () => {
      clearInterval(id);
      intervalRef.current = 0;
      debugLog.info('[Target Mob Reader] Clearing read interval.');
    };
  }, [status, readTarget, readInterval]);

  const handleScanClick = () => {
    setTargetData({ hp: 0, name: 'Not Found' });
    if (lastMobNameplatePos !== null) {
      setLastMobNameplatePos(null);
    }
    dispatch({ type: 'LOADED IMAGES' });
    const cleared = clearAllDebuffs(lastDetectedRef);
    if (cleared.size > 0) {
      syncIdentifiedBuffs(cleared);
      debugLog.info(`[Target Mob Reader] Force clearing enemy debuffs.`)
    }
  };

  return (
    <>  
      <div style={{ padding: '5px', border: '1px solid #555', marginTop: '5px', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Enemy Nameplate Reader</p>
          <p style={{ margin: 0, fontSize: '0.9em' }}>Status: {status}</p>
        {status === "FINDING NAMEPLATE" && (
          <div style={{padding: '5px', border: '1px solid red', marginTop: '5px' }}>
            <button onClick={handleScanClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">🔍 Scan for Nameplate</button>
            <p>Be sure your Target Nameplate is <strong>locked</strong>. You can do this by unlocking your interface so that the lock icon appears on the nameplate then unlocking the nameplate and dragging it to a specific spot on your interface. Leave the Nameplate unlocked and lock your Interface to remove the lock icon from the nameplate.</p>
          </div>
        )}
        {debugMode && (
          <div style={{ marginTop: '5px', fontSize: '0.9em', borderTop: '1px solid #444', paddingTop: '5px' }}>
            <p>Name: {targetData.name}</p>
            <p>HP: {targetData.hp}</p>
            <p>Pos: {lastMobNameplatePos ? `(${lastMobNameplatePos.x}, ${lastMobNameplatePos.y})` : 'N/A'}</p>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          </div>
        )}
      </div>
    </>
  );
};