import { useEffect, useRef, useCallback, useState } from 'react';
import TargetMobReader from 'alt1/targetmob';
import useStore from '../store';
import a1lib from 'alt1';

import Bloated from '../assets/data/bloated.data.png';
import DeathMark from '../assets/data/Death_Mark.data.png';
import Vulnerability from '../assets/data/Vulnerability_bordered.data.png';

const enemyDebuffImages = {
    'Bloat': Bloated,
    'Death Mark': DeathMark,
    'Vulnerability': Vulnerability,
}

type ReaderStatus = "LOADING IMAGES" | "READING" | "ERROR";

interface TargetMobReaderProps {
    debugMode: boolean;
    readInterval?: number;
    a1lib: any;
}

interface TargetMobReaderComponent {
    lastMobNameplatePos: a1lib.PointLike | null;
    targetReaderStatus: ReaderStatus;
    setTargetReaderStatus: (status: ReaderStatus) => void;
    setLastMobNameplatePos: (pos: a1lib.PointLike | null) => void;
}

function getDebuffUpdates({
  imageMap,
  captureRegion,
  lastDetectedRef,
}: {
  imageMap: Map<string, any>;
  captureRegion: any;
  lastDetectedRef: React.RefObject<Record<string, boolean>>;
}): Map<string, { name: string; isActive: boolean }> | null {
  const updates = new Map<string, { name: string; isActive: boolean }>();

  for (const name of Object.keys(enemyDebuffImages)) {
    const image = imageMap.get(name);
    if (!image) continue;

    const isDetected = captureRegion.findSubimage(image).length > 0;

    if (isDetected !== lastDetectedRef.current[name]) {
      lastDetectedRef.current[name] = isDetected;
      updates.set(name, { name, isActive: isDetected });
    }
  }

  return updates.size > 0 ? updates : null;
}

function clearAllDebuffs(lastDetectedRef: React.RefObject<Record<string, boolean>>): Map<string, { name: string; isActive: boolean }> {
  const cleared = new Map<string, { name: string; isActive: boolean }>();

  for (const name of Object.keys(enemyDebuffImages)) {
    if (lastDetectedRef.current[name] !== false) {
      lastDetectedRef.current[name] = false;
      cleared.set(name, { name, isActive: false });
    }
  }

  return cleared;
}

  export const TargetMobReaderComponent = ({ readInterval = 300, debugMode, a1lib }: TargetMobReaderProps) => {
    const {
      lastMobNameplatePos,
      setLastMobNameplatePos,
      targetReaderStatus,
      setTargetReaderStatus,
      syncIdentifiedBuffs,
    } = useStore();
  
    const [targetData, setTargetData] = useState<{ hp: number | string; name: string }>({ hp: 'Not Found', name: 'Not Found' });
    const readerRef = useRef<TargetMobReader>(new TargetMobReader());
    const intervalRef = useRef<number | null>(null);
    const resolvedImagesRef = useRef<Map<string, any> | null>(null);

    const lastDetectedRef = useRef<Record<string, boolean>>({});

    setTargetReaderStatus("LOADING IMAGES");
  
    const findTargetPosition = useCallback(() => {
      setTargetReaderStatus("READING");
  
      const result = readerRef.current.read();
      if (result) {
        setTargetData({ hp: result.hp ?? '', name: result.name ?? '' });
        setLastMobNameplatePos(readerRef.current.lastpos);
      } else {
        const currentPos = readerRef.current.lastpos ?? lastMobNameplatePos;
    
        if (currentPos && resolvedImagesRef.current) {
          const target_display_loc = {
            x: currentPos.x - 120,
            y: currentPos.y + 20,
            w: 150,
            h: 60,
          };
        
          const captureRegion = a1lib.captureHold(
            target_display_loc.x,
            target_display_loc.y,
            target_display_loc.w,
            target_display_loc.h
          );
    
          const debuffUpdates = getDebuffUpdates({
              imageMap: resolvedImagesRef.current, 
              captureRegion: captureRegion, 
              lastDetectedRef: lastDetectedRef
          });
          
          if (debuffUpdates) {
            syncIdentifiedBuffs(debuffUpdates);
          }
        }
      }
    }, [setLastMobNameplatePos, setTargetReaderStatus]);
  
    const readTarget = useCallback(() => {
      const result = readerRef.current.read();
    
      if (result) {
        setTargetData({ hp: result.hp ?? '', name: result.name ?? '' });
        setLastMobNameplatePos(readerRef.current.lastpos);
      }

      const currentPos = readerRef.current.lastpos ?? lastMobNameplatePos;
    
      if (currentPos && resolvedImagesRef.current) {
        const target_display_loc = {
          x: currentPos.x - 120,
          y: currentPos.y + 20,
          w: 150,
          h: 60,
        };
      
        const captureRegion = a1lib.captureHold(
          target_display_loc.x,
          target_display_loc.y,
          target_display_loc.w,
          target_display_loc.h
        );
  
        const debuffUpdates = getDebuffUpdates({
            imageMap: resolvedImagesRef.current, 
            captureRegion: captureRegion, 
            lastDetectedRef: lastDetectedRef
        });
        
        if (debuffUpdates) {
          syncIdentifiedBuffs(debuffUpdates);
        }
      } else if (resolvedImagesRef.current) {
        const cleared = clearAllDebuffs(lastDetectedRef);
        if (cleared.size > 0) {
          syncIdentifiedBuffs(cleared);
        }
      }
        
    }, [a1lib, lastMobNameplatePos, setLastMobNameplatePos, syncIdentifiedBuffs]);

    useEffect(() => {
      lastDetectedRef.current = {
        'Bloat': false,
        'Death Mark': false,
        'Vulnerability': false,
      };
    }, []);
  
    useEffect(() => {
      if (targetReaderStatus === "LOADING IMAGES" && !resolvedImagesRef.current) {
          const loadImages = async () => {
            try {
              const loadedModules = await Promise.all(Object.values(enemyDebuffImages));
              const resolvedMap = new Map<string, any>();
              Object.keys(enemyDebuffImages).forEach((name, index) => {
                resolvedMap.set(name, loadedModules[index]);
              });
              resolvedImagesRef.current = resolvedMap;
              console.log("✅ Enemy Debuff reference images loaded successfully.");
              setTargetReaderStatus("READING");
            } catch (error) {
              console.error("Failed to load enemy debuff reference images:", error);
              setTargetReaderStatus("ERROR");
            }
          };
          loadImages();
      } else if (targetReaderStatus === "READING" && intervalRef.current === null) {
        console.log("[Target Reader] Starting read interval...");
        intervalRef.current = setInterval(readTarget, readInterval);
      } else if (targetReaderStatus !== "READING" && intervalRef.current !== null) {
        console.log("[Target Reader] Clearing read interval.");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    
      return () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [targetReaderStatus, readInterval, readTarget, setTargetReaderStatus]);

    const handleScanClick = () => {
      setLastMobNameplatePos(null);
      findTargetPosition();
    };
  
    return (
        <>
      <div>
        <button
          onClick={handleScanClick}
          style={{
            padding: "6px 12px",
            backgroundColor: "#222",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          🔍 Scan for Nameplate
        </button>
      </div>
      {debugMode && (
        <>
        <div style={{ padding: '5px', border: '1px solid #555', marginTop: '5px' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Target Mob Reader</p>
            <p style={{ margin: 0, fontSize: '0.9em' }}>Status: {targetReaderStatus}</p>
        </div>

        {targetReaderStatus === "READING" && (
            <div style={{ marginTop: '5px', fontSize: '0.9em', borderTop: '1px solid #444', paddingTop: '5px' }}>
            <p style={{ margin: 0 }}>Name: {targetData.name ?? "Not Found"}</p>
            <p style={{ margin: 0 }}>HP: {targetData.hp ?? "Not Found"}</p>
            <p style={{ margin: 0 }}>
                LastPos:{" "}
                {lastMobNameplatePos ? `(${lastMobNameplatePos.x}, ${lastMobNameplatePos.y})` : "Nameplate not found"}
            </p>
            </div>
        )}

        {targetReaderStatus === "ERROR" && (
            <div style={{ color: "red" }}>Error reading target nameplate. Please re-scan.</div>
        )}
        </>
    )}
      </>
    );
  };