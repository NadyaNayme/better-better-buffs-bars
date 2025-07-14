import { useEffect, useMemo, useRef, useState } from 'react';
import { useBuffProcessor } from '../../../hooks/useBuffProcessor';
import useStore from '../../../store';
import * as BuffReader from 'alt1/buffs';
import { rawImageMap } from '../../../data/imageData';
import { debugLog } from '../../../lib/debugLog';
import { isRuntimeBuff } from '../../../types/Buff';
import { throttle } from 'lodash-es';

const READ_INTERVAL = 300; // How often to read & update our data from the buffs bars
const THROTTLE_INTERVAL = 400; // How often to process the data
const RETRY_INTERVAL = 5000; // How often to retry finding the buff & debuff bars
type ReaderStatus = 'IDLE' | 'FOUND' | 'FAILED';

export function GlobalBuffProcessor() {
  const { calculateBuffUpdates } = useBuffProcessor();
  const { syncIdentifiedBuffs } = useStore();
  const resolvedImagesRef = useRef<Map<string, any> | null>(null);
  const buffReaderRef = useRef<any>(new BuffReader.default());
  const debuffReaderRef = useRef<any>(new BuffReader.default());
  debuffReaderRef.current.debuffs = true;
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
          debugLog.error(`Cannot draw buff - it is missing runtime properties. ${group.name} -> ${buff.name}`)
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

  // ✨ THROTTLING: Create the throttled processor
  const throttledCalculateUpdates = useMemo(() => {
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

    const setupReader = (
      readerRef: React.RefObject<any>,
      statusRef: React.RefObject<ReaderStatus>,
      isDebuff: boolean
    ) => {
      let intervalId = 0;
      let retryIntervalId = 0;
      const readerName = isDebuff ? "Debuffs" : "Buffs";

      const processData = () => {
        const detectedData = readerRef.current.read();
        if (detectedData?.length > 0) {
          throttledCalculateUpdates(detectedData, isDebuff);
        }
      };

      const startProcessing = () => {
        debugLog.verbose(`Starting ${readerName} processing loop...`);
        intervalId = window.setInterval(processData, READ_INTERVAL);
      };
      
      const tryFindReader = () => {
        debugLog.retrying(`Retrying ${readerName} bar detection...`);
        if (readerRef.current.find()) {
          debugLog.success(`${readerName} bar found on retry!`);
          statusRef.current = 'FOUND';
          clearInterval(retryIntervalId);
          startProcessing();
        }
      };

      if (statusRef.current === 'IDLE') {
        debugLog.info(`Attempting to find ${readerName} bar...`);
        if (readerRef.current.find()) {
          debugLog.success(`${readerName} bar found!`);
          statusRef.current = 'FOUND';
          startProcessing();
        } else {
          debugLog.error(`Could not find ${readerName} bar. Will retry every ${RETRY_INTERVAL / 1000}s.`);
          statusRef.current = 'FAILED';
          retryIntervalId = window.setInterval(tryFindReader, RETRY_INTERVAL);
        }
      }

      // Return a cleanup function for this specific reader
      return () => {
        if (intervalId) clearInterval(intervalId);
        if (retryIntervalId) clearInterval(retryIntervalId);
        statusRef.current = 'IDLE';
        debugLog.info(`Stopped ${readerName} processing loop.`);
      };
    };

    // Setup both readers
    const cleanupBuffs = setupReader(buffReaderRef, buffsReaderStatusRef, false);
    const cleanupDebuffs = setupReader(debuffReaderRef, debuffsReaderStatusRef, true);

    // Return a function that calls both cleanup functions
    return () => {
      cleanupBuffs();
      cleanupDebuffs();
    };
  }, [loadedImageSetId, throttledCalculateUpdates]);

  return null;
}