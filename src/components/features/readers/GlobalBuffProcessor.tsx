import { useEffect, useMemo, useRef, useState } from 'react';
import { useBuffProcessor } from '../../../hooks/useBuffProcessor';
import useStore from '../../../store';
import * as BuffReader from 'alt1/buffs';
import { rawImageMap } from '../../../data/imageData';
import { debugLog } from '../../../lib/debugLog';

const READ_INTERVAL = 250;
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
        names.add(buff.name);
        if (buff.childBuffNames) {
          for (const child of buff.childBuffNames) {
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

  useEffect(() => {
    if (!loadedImageSetId) {
      return;
    }

    let intervalId: number = 0;
    let buffRetryIntervalId: number = 0;

    const initializeAndStartBuffsReader = () => {
      const tryFindReader = () => {
        debugLog.retrying("Retrying Buffs bar detection...");
        const found = buffReaderRef.current.find();
        if (found) {
          debugLog.success("Buffs bar found on retry!");
          buffsReaderStatusRef.current = 'FOUND';
          clearInterval(buffRetryIntervalId);
          startBuffsProcessing();
        }
      };

      const startBuffsProcessing = () => {
        debugLog.verbose("Starting BUFFS processing loop...");
        intervalId = window.setInterval(() => {
          const detectedData = buffReaderRef.current.read();
          if (!detectedData || detectedData.length === 0) return;
          const payload = calculateBuffUpdatesRef.current(detectedData, resolvedImagesRef.current!, false);
          if (payload.size > 0) {
            syncIdentifiedBuffsRef.current(payload);
          }
        }, READ_INTERVAL);
      };

      if (buffsReaderStatusRef.current === 'IDLE') {
        debugLog.info("Attempting to find Buffs bar...");
        const found = buffReaderRef.current.find();
        if (found) {
          debugLog.success("Buffs bar found!");
          buffsReaderStatusRef.current = 'FOUND';
          startBuffsProcessing();
        } else {
          debugLog.error("Could not find Buffs bar. Will retry every 5s.");
          buffsReaderStatusRef.current = 'FAILED';
          buffRetryIntervalId = window.setInterval(tryFindReader, 5000);
        }
      }
    };

    initializeAndStartBuffsReader();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        debugLog.error("Stopping BUFFS processing loop.");
      }
      if (buffRetryIntervalId) {
        clearInterval(buffRetryIntervalId);
        debugLog.error("Stopping BUFFS retry loop.");
      }
    };
  }, [loadedImageSetId]);

  useEffect(() => {
    if (!loadedImageSetId) {
      return;
    }

    let intervalId: number = 0;
    let debuffRetryIntervalId: number = 0;

    const initializeAndStartDebuffsReader = () => {
      const tryFindReader = () => {
        debugLog.retrying("Retrying Debuffs bar detection...");
        const found = debuffReaderRef.current.find();
        if (found) {
          debugLog.success("Debuffs bar found on retry!");
          debuffsReaderStatusRef.current = 'FOUND';
          clearInterval(debuffRetryIntervalId);
          startDebuffsProcessing();
        }
      };

      const startDebuffsProcessing = () => {
        debugLog.verbose("Starting DEBUFFS processing loop...");
        intervalId = window.setInterval(() => {
          const detectedData = debuffReaderRef.current.read();
          if (!detectedData || detectedData.length === 0) return;
          const payload = calculateBuffUpdatesRef.current(detectedData, resolvedImagesRef.current!, true);
          if (payload.size > 0) {
            syncIdentifiedBuffsRef.current(payload);
          }
        }, READ_INTERVAL);
      };

      if (debuffsReaderStatusRef.current === 'IDLE') {
        debugLog.info("Attempting to find Debuffs bar...");
        const found = debuffReaderRef.current.find();
        if (found) {
          debugLog.success("Debuffs bar found!");
          debuffsReaderStatusRef.current = 'FOUND';
          startDebuffsProcessing();
        } else {
          debugLog.error("Could not find Debuffs bar. Will retry every 5s.");
          debuffsReaderStatusRef.current = 'FAILED';
          debuffRetryIntervalId = window.setInterval(tryFindReader, 5000);
        }
      }
    };

    initializeAndStartDebuffsReader();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        debugLog.error("Stopping DEBUFFS processing loop.");
      }
      if (debuffRetryIntervalId) {
        clearInterval(debuffRetryIntervalId);
        debugLog.error("Stopping DEBUFFS retry loop.");
      }
    };
  }, [loadedImageSetId]);

  return null;
}