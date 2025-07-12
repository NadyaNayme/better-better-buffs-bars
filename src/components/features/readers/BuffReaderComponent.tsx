import { useState, useEffect, useRef, useCallback } from 'react';
import * as BuffReader from 'alt1/buffs';
import { isRuntimeBuff, type BuffInstance } from '../../../types/Buff';
import useStore from '../../../store/store';
import { debugLog } from '../../../lib/debugLog';
import { rawImageMap } from '../../../data/imageData';

interface BuffReaderProps {
  isDebuff?: boolean;
  debugMode: boolean;
  onBuffsIdentified: (identifiedBuffs: Map<string, { time: number }>) => void;
  readInterval?: number;
}

type ComponentStatus = "IDLE" | "LOADING_IMAGES" | "FINDING_BAR" | "READING" | "ERROR";

const isAlt1 = typeof window.alt1 !== "undefined";

export function BuffReaderComponent({ 
  isDebuff = false, 
  debugMode,
  onBuffsIdentified,
  readInterval = 250,
}: BuffReaderProps) {
  const [status, setStatus] = useState<ComponentStatus>("IDLE");
  const [enableDebug, setEnableDebug] = useState(false);
  const [debugMatchData, setDebugMatchData] = useState(new Map());

  const readerRef = useRef<any>(null);
  const resolvedImagesRef = useRef<Map<string, any> | null>(null);
  const intervalRef = useRef<number | null>(null);
  const findRetryTimeoutRef = useRef<number | null>(null);

  const updateDebugData = (buffName: string, fail: number, pass: number) => {
    if (!enableDebug) return;
    setDebugMatchData(prev => {
      const newMap = new Map(prev);
      const history = newMap.get(buffName) || [];
      const newHistory = [...history, { fail, pass }];
  
      if (newHistory.length > 100) newHistory.shift();
  
      newMap.set(buffName, newHistory);
      return newMap;
    });
  };

  const formatStats = (arr: number[]) => {
    if (!arr.length) return "N/A";
    const values = arr.map(x => x);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Math.round(values.reduce((a,b) => a+b, 0) / values.length);
    return `Min: ${min}, Max: ${max}, Avg: ${avg}`;
  };

  const processReaderData = useCallback((detectedBuffs: any[]) => {
    if (!resolvedImagesRef.current) return;

    const groups = useStore.getState().groups;
    const allBuffs = useStore.getState().buffs;
  
    const trackedBuffMap = new Map<string,BuffInstance>(groups.flatMap((g: { buffs: BuffInstance[]; }) => g.buffs).map((b: { name: string; }) => [b.name, b]));
    const finalPayloadMap = new Map<string, any>();
  
    const lastChildFoundTimeRef = useRef<Map<string, number>>(new Map());
    for (const detected of detectedBuffs) {
      for (const [name, trackedBuff] of trackedBuffMap.entries()) {
        if (isDebuff && (trackedBuff.type === "NormalBuff" || trackedBuff.type === "AbilityBuff" || trackedBuff.type === "StackBuff" || trackedBuff.type === "PermanentBuff")) continue;
        if (!isDebuff && (trackedBuff.type === "NormalDebuff" || trackedBuff.type === "WeaponSpecial")) continue;
        if (trackedBuff.type === "TargetDebuff") continue;
  
        const { passThreshold, failThreshold } = useStore.getState().getBuffThresholds(trackedBuff.name);
  
        // Meta buff logic
        if (trackedBuff.type === 'MetaBuff' && trackedBuff.children) {
          let matchedChild: BuffInstance | null = null;
        
          for (const childName of trackedBuff.children) {
            const img = resolvedImagesRef.current.get(childName);
            if (!img) continue;
        
            const match = detected.countMatch(img, false);
            if (enableDebug) {
              updateDebugData(trackedBuff.name, match.failed, match.passed);
              debugLog.verbose(trackedBuff.name, match.failed, match.passed);
            }
        
            if (match.passed >= passThreshold && match.failed <= failThreshold) {
              matchedChild = allBuffs.find((b: { name: string }) => b.name === childName) ?? null;
              break;
            }
          }

          const now = Date.now();
          if (matchedChild) {
            lastChildFoundTimeRef.current.set(name, now);
            finalPayloadMap.set(name, {
              name: trackedBuff.name,
              timeRemaining: trackedBuff.timeRemaining,
              childName: matchedChild.name,
              foundChild: {
                name: matchedChild.name,
                timeRemaining: matchedChild.timeRemaining,
                imageData: matchedChild.scaledImageData ?? matchedChild.imageData,
                desaturatedImageData: matchedChild.scaledDesaturatedImageData ?? matchedChild.desaturatedImageData,
              },
            });
          } else {
            const lastFound = lastChildFoundTimeRef.current.get(name) ?? 0;
            if (now - lastFound >= 3000) {
              finalPayloadMap.set(name, {
                name: trackedBuff.name,
                timeRemaining: trackedBuff.timeRemaining,
                childName: 'NO CHILD MATCHED',
                foundChild: null,
              });
            }
          }
        }
  
        // Normal buff logic
        else {
          const refImg = resolvedImagesRef.current.get(name);
          if (!refImg) continue;
  
          const match = detected.countMatch(refImg, false);
          if (enableDebug) {
            debugLog.verbose(trackedBuff.name, match.failed, match.passed);
            updateDebugData(trackedBuff.name, match.failed, match.passed);
          }
          if (match.passed >= passThreshold && match.failed <= failThreshold) {
            debugLog.verbose(`Above thresholds were able to find a match for: ${trackedBuff.name}`)
            finalPayloadMap.set(name, {
              name,
              timeRemaining: detected.readTime ? detected.readTime() : detected.timeRemaining,
            });
          }
        }
      }
    }
  
    onBuffsIdentified(finalPayloadMap);
  }, [onBuffsIdentified, enableDebug]);

  useEffect(() => {
    if (!enableDebug) {
      setDebugMatchData(new Map());
    }
  }, [enableDebug]);

  useEffect(() => {
    const cleanup = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (findRetryTimeoutRef.current) clearTimeout(findRetryTimeoutRef.current);
    };
    
    if (status === "IDLE") {
      if (isAlt1) {
        setStatus("LOADING_IMAGES");
      }
    }
    
    else if (status === "LOADING_IMAGES") {
      const loadImages = async () => {
        const imageNames = Object.keys(rawImageMap);
        const promises = Object.values(rawImageMap);
        try {
          const loadedModules = await Promise.all(promises);
          const resolvedMap = new Map<string, any>();
          imageNames.forEach((name, index) => {
            resolvedMap.set(name, loadedModules[index]);
          });
          resolvedImagesRef.current = resolvedMap;
          debugLog.success("Buff image references loaded successfully.");
          setStatus("FINDING_BAR");
        } catch (error) {
          debugLog.error("Failed to load buff image references: ", error);
          setStatus("ERROR");
        }
      };
      loadImages();
    }
    
    else if (status === "FINDING_BAR") {
      const findBar = () => {
        if (!readerRef.current) {
          readerRef.current = new BuffReader.default();
          if (isDebuff) readerRef.current.debuffs = true;
        }
        
        const position = readerRef.current.find();
        if (position) {
          setStatus("READING");
        } else {
          findRetryTimeoutRef.current = setTimeout(findBar, 3000);
        }
      }
      findBar();
    }
    
    else if (status === "READING" && intervalRef.current === null) {
      debugLog.info(`[${isDebuff ? "Debuff" : "Buff"} Reader] Starting read interval...`);
      intervalRef.current = setInterval(() => {
        const data = readerRef.current?.read();
        if (data) {
          processReaderData(data);
        }
      }, readInterval);
    }
    
    return cleanup;
  }, [status, isDebuff, readInterval, processReaderData]);

  return (debugMode &&
    <>
      <div style={{ padding: '5px', border: '1px solid #555', marginTop: '5px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{isDebuff ? "Debuff Reader" : "Buff Reader"}</p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Status: {status}</p>
      </div>
      <label style={{ display: 'block', marginBottom: 10 }}>
        <input
          type="checkbox"
          checked={enableDebug}
          onChange={(e) => setEnableDebug(e.target.checked)}
        />
        Enable Thresholds Debugging
      </label>
      {enableDebug && (
      <div style={{ marginTop: 10 }}>
        <h4>{isDebuff ? "Debuff Threshold Data" : "Buff Threshold Data"}</h4>
        {[...debugMatchData.entries()].map(([buffName, history]) => {
          const failArr = history.map((e: { fail: number; }) => e.fail);
          const passArr = history.map((e: { pass: number; }) => e.pass);
          return (
            <div key={buffName}>
              <strong>{buffName}</strong><br/>
              Fail: {formatStats(failArr)} | Pass: {formatStats(passArr)}
            </div>
          );
        })}
      </div>)}
    </>
  );
}