import { useEffect, useMemo, useRef, useState } from 'react';
import { useBuffProcessor } from '../../../hooks/useBuffProcessor';
import useStore from '../../../store';
import * as BuffReader from 'alt1/buffs';
import { rawImageMap } from '../../../data/imageData';
import { debugLog } from '../../../lib/debugLog';
import { isRuntimeBuff } from '../../../types/Buff';
import { throttle } from 'lodash-es';

const READ_INTERVAL = 200; // How often to read & update our data from the buffs bars
const THROTTLE_INTERVAL = 300; // How often to process the data
const RETRY_INTERVAL = 5000; // How often to retry finding the buff & debuff bars
type ReaderStatus = 'IDLE' | 'FOUND' | 'FAILED';

export function GlobalBuffProcessor() {
  const { calculateBuffUpdates } = useBuffProcessor();
  const { syncIdentifiedBuffs } = useStore();
  const resolvedImagesRef = useRef<Map<string, any> | null>(null);
  const buffsReaderStatusRef = useRef<ReaderStatus>('IDLE');
  const debuffsReaderStatusRef = useRef<ReaderStatus>('IDLE');
  const [loadedImageSetId, setLoadedImageSetId] = useState<string | null>(null);
  const calculateBuffUpdatesRef = useRef(calculateBuffUpdates);
  const syncIdentifiedBuffsRef = useRef(syncIdentifiedBuffs);
  
      

  const groups = useStore(state => state.groups);

  const buffsToLoadNames = useMemo(() => {
    const names = new Set<string>();
    for (const group of groups) {
      for (const buff of group.buffs) {
        if (!isRuntimeBuff(buff)) { 
          debugLog.error(`Cannot draw buff - it is missing runtime properties.`)
          continue 
        };
        names.add(buff.name);
        if (buff.children) {
          for (const child of buff.children) {
            names.add(child);
          }
        }
      }
    }
    return Array.from(names).sort();
  }, [groups]);
  
  const buffsToLoadId = useMemo(() => {
    return buffsToLoadNames.join(',');
  }, [buffsToLoadNames]);

  useEffect(() => {
    calculateBuffUpdatesRef.current = calculateBuffUpdates;
    syncIdentifiedBuffsRef.current = syncIdentifiedBuffs;
  }, [calculateBuffUpdates, syncIdentifiedBuffs]);
  
  useEffect(() => {
    if (buffsToLoadNames.length === 0) {
      setLoadedImageSetId(null);
      return;
    }
    const loadRequiredImages  = async () => {
      debugLog.info(`Loading ${buffsToLoadNames.length} required images...`);
      const filteredImagePromises = new Map<string, string>();
      for (const name of buffsToLoadNames) {
        if (rawImageMap[name]) {
          filteredImagePromises.set(name, rawImageMap[name]);
        }
      }
      try {
        const imageNames = Array.from(filteredImagePromises.keys());
        const promises = Array.from(filteredImagePromises.values());

        const loadedModules = await Promise.all(promises);
        const resolvedMap = new Map<string, any>();
        imageNames.forEach((name, index) => {
          resolvedMap.set(name, loadedModules[index]);
        });
        resolvedImagesRef.current = resolvedMap;
        debugLog.success("Buff & debuff reference images loaded successfully.");
        setLoadedImageSetId(buffsToLoadId);
      } catch (error) {
        debugLog.error("Failed to load buff & debuff reference images:", error);
      }
    };
    if (buffsToLoadId !== loadedImageSetId) {
      loadRequiredImages();
    }
  }, [buffsToLoadId, loadedImageSetId, buffsToLoadNames]);

  
  const throttledBuffCalculateUpdates = useMemo(() => {
    const execute = (detectedData: any[], isDebuff: boolean) => {
      if (!resolvedImagesRef.current) return;
      const updates = calculateBuffUpdatesRef.current(detectedData, resolvedImagesRef.current, isDebuff);
      if (updates.size > 0) {
        syncIdentifiedBuffsRef.current(updates);
      }
    };
    return throttle(execute, THROTTLE_INTERVAL, { leading: true, trailing: false });
  }, []);

  const throttledDebuffCalculateUpdates = useMemo(() => {
    const execute = (detectedData: any[], isDebuff: boolean) => {
      if (!resolvedImagesRef.current) return;
      const updates = calculateBuffUpdatesRef.current(detectedData, resolvedImagesRef.current, isDebuff);
      if (updates.size > 0) {
        syncIdentifiedBuffsRef.current(updates);
      }
    };
    return throttle(execute, THROTTLE_INTERVAL, { leading: true, trailing: false });
  }, []);


  useEffect(() => {
    if (!loadedImageSetId) return;

    // The setupReader function is now self-contained for buffs
    const setupBuffReader = () => {
        let intervalId = 0;
        let retryIntervalId = 0;

        const reader = new BuffReader.default();

        const processData = () => {
            const detectedData = reader.read();
            if (detectedData && detectedData?.length > 0) {
              throttledBuffCalculateUpdates(detectedData, false);
            }
        };

        const startProcessing = () => {
            debugLog.verbose("Starting Buffs processing loop...");
            intervalId = window.setInterval(processData, READ_INTERVAL);
        };
        
        const tryFindReader = () => {
            debugLog.retrying("Retrying Buffs bar detection...");
            if (reader.find()) {
                debugLog.success("Buffs bar found on retry!");
                buffsReaderStatusRef.current = 'FOUND';
                clearInterval(retryIntervalId);
                startProcessing();
            }
        };

        if (buffsReaderStatusRef.current === 'IDLE') {
            debugLog.info("Attempting to find Buffs bar...");
            if (reader.find()) {
                debugLog.success("Buffs bar found!");
                debugLog.info(`Buff bar position: `, reader.pos)
                buffsReaderStatusRef.current = 'FOUND';
                startProcessing();
            } else {
                debugLog.error("Could not find Buffs bar. Will retry.");
                buffsReaderStatusRef.current = 'FAILED';
                retryIntervalId = window.setInterval(tryFindReader, RETRY_INTERVAL);
            }
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (retryIntervalId) clearInterval(retryIntervalId);
            buffsReaderStatusRef.current = 'IDLE';
            debugLog.info("Stopped Buffs processing loop.");
        };
    };

    const cleanup = setupBuffReader();
    return () => cleanup();

}, [loadedImageSetId, throttledBuffCalculateUpdates]);


// useEffect for the DEBUFFS reader
useEffect(() => {
    if (!loadedImageSetId) return;

    // A separate, identical setup function for debuffs
    const setupDebuffReader = () => {
        let intervalId = 0;
        let retryIntervalId = 0;
        
        const reader = new BuffReader.default();
        reader.debuffs = true; 

        const processData = () => {
            const detectedData = reader.read();
            if (detectedData && detectedData?.length > 0) {
                throttledDebuffCalculateUpdates(detectedData, true);
            }
        };

        const startProcessing = () => {
            debugLog.verbose("Starting Debuffs processing loop...");
            intervalId = window.setInterval(processData, READ_INTERVAL);
        };
        
        const tryFindReader = () => {
            debugLog.retrying("Retrying Debuffs bar detection...");
            if (reader.find()) {
                debugLog.success("Debuffs bar found on retry!");
                debuffsReaderStatusRef.current = 'FOUND';
                clearInterval(retryIntervalId);
                startProcessing();
            }
        };

        if (debuffsReaderStatusRef.current === 'IDLE') {
            debugLog.info("Attempting to find Debuffs bar...");
            if (reader.find()) {
                debugLog.success("Debuffs bar found!");
                debugLog.info(`Debuff bar position: `, reader.pos)
                debuffsReaderStatusRef.current = 'FOUND';
                startProcessing();
            } else {
                debugLog.error("Could not find Debuffs bar. Will retry.");
                debuffsReaderStatusRef.current = 'FAILED';
                retryIntervalId = window.setInterval(tryFindReader, RETRY_INTERVAL);
            }
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (retryIntervalId) clearInterval(retryIntervalId);
            debuffsReaderStatusRef.current = 'IDLE';
            debugLog.info("Stopped Debuffs processing loop.");
        };
    };

    const cleanup = setupDebuffReader();
    return () => cleanup();

}, [loadedImageSetId, throttledDebuffCalculateUpdates]);

  return null;
}