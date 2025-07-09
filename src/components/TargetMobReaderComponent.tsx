import { useEffect, useRef, useCallback } from 'react';
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

type ReaderStatus = "IDLE" | "LOADING IMAGES" | "FINDING NAMEPLATE" | "READING" | "ERROR";

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

function detectAllEnemyDebuffs({
  imageMap,
  captureRegion,
  lastDetectedRef,
}: {
  imageMap: Map<string, any>;
  captureRegion: any;
  lastDetectedRef: React.RefObject<Record<string, boolean>>;
}) {
  const updates: [string, { name: string; isActive: boolean }][] = [];

  for (const name of Object.keys(enemyDebuffImages)) {
    const image = imageMap.get(name);
    if (!image) continue;

    const isDetected = captureRegion.findSubimage(image).length > 0;

    if (isDetected !== lastDetectedRef.current[name]) {
      lastDetectedRef.current[name] = isDetected;

      updates.push([
        name,
        {
          name,
          isActive: isDetected,
        },
      ]);
    }
  }

  if (updates.length > 0) {
    useStore.getState().syncIdentifiedBuffs(new Map(updates));
  }
}

  export const TargetMobReaderComponent = ({ readInterval = 300, debugMode, a1lib }: TargetMobReaderProps) => {
    const {
      lastMobNameplatePos,
      setLastMobNameplatePos,
      targetReaderStatus,
      setTargetReaderStatus,
    } = useStore();
  
    const state = useRef<{ hp: number; name: string }>({ hp: 0, name: '' });
    const readerRef = useRef<TargetMobReader>(new TargetMobReader());
    const intervalRef = useRef<number | null>(null);
    const resolvedImagesRef = useRef<Map<string, any> | null>(null);

    const lastDetectedRef = useRef<Record<string, boolean>>({});
  
    const findTargetPosition = useCallback(() => {
      setTargetReaderStatus("LOADING IMAGES");
  
      const result = readerRef.current.read();
      if (result) {
        state.current.hp = result.hp;
        state.current.name = result.name;
        setLastMobNameplatePos(readerRef.current.lastpos);
      }
    }, [setLastMobNameplatePos, setTargetReaderStatus]);
  
    const readTarget = useCallback(() => {
      const result = readerRef.current.read();
    
      if (result) {
        state.current.hp = result.hp ?? '';
        state.current.name = result.name ?? '';
        setLastMobNameplatePos(readerRef.current.lastpos);
      }
    
      if (!readerRef.current.lastpos || !state.current.name) {
        console.log("[TargetMobReader] No target found — clearing buffs");
    
        const clearBuffs: [string, { name: string; isActive: boolean; timeRemaining: number }][] =
        Object.keys(enemyDebuffImages).map(name => {
          return [name, { name, isActive: false, timeRemaining: 0 }];
        });
    
        useStore.getState().syncIdentifiedBuffs(new Map(clearBuffs));
    
        Object.keys(enemyDebuffImages).forEach(name => {
          lastDetectedRef.current[name] = false;
        });
    
        return;
      }
    
        const target_display_loc = {
          x: readerRef.current.lastpos.x - 120,
          y: readerRef.current.lastpos.y + 20,
          w: 150,
          h: 60,
        };
      
        const targetDebuffs = a1lib.captureHold(
          target_display_loc.x,
          target_display_loc.y,
          target_display_loc.w,
          target_display_loc.h
        );
      
        detectAllEnemyDebuffs({imageMap: resolvedImagesRef.current as Map<string, any>, captureRegion: targetDebuffs, lastDetectedRef: lastDetectedRef});
    }, []);

    useEffect(() => {
      lastDetectedRef.current = {
        'Bloat': false,
        'Death Mark': false,
        'Vulnerability': false,
      };
    }, []);
  
    useEffect(() => {
        if (targetReaderStatus === "IDLE") {
          if (lastMobNameplatePos === null) {
            findTargetPosition();
          } else {
            setTargetReaderStatus("LOADING IMAGES");
          }
        } else if (targetReaderStatus === "LOADING IMAGES") {
            const loadImages = async () => {
              const imageNames = Object.keys(enemyDebuffImages);
              const promises = Object.values(enemyDebuffImages);
              try {
                const loadedModules = await Promise.all(promises);
                const resolvedMap = new Map<string, any>();
                imageNames.forEach((name, index) => {
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
          } else if (
          targetReaderStatus === "READING" &&
          intervalRef.current === null &&
          readerRef.current
        ) {
          console.log("[Target Reader] Starting read interval...");
          intervalRef.current = setInterval(() => {
            readTarget();
          }, readInterval);
        } else if (
          targetReaderStatus !== "READING" &&
          intervalRef.current !== null
        ) {
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
      }, [targetReaderStatus, findTargetPosition, readTarget]);
  
    return (
        <>
      <div>
        <button
          onClick={() => {
            setLastMobNameplatePos(null);
            setTargetReaderStatus("IDLE");
          }}
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
            <p style={{ margin: 0 }}>Name: {state.current.name ?? "Not Found"}</p>
            <p style={{ margin: 0 }}>HP: {state.current.hp ?? "Not Found"}</p>
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