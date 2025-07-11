import { useCallback } from 'react';
import useStore from '../store';
import { debugLog } from '../lib/debugLog';
import type { Group } from '../types/Group';

export function useBuffProcessor() {
  const calculateBuffUpdates = useCallback((
    detectedBuffs: any[],
    resolvedImages: Map<string, any>,
    isDebuff: boolean
  ): Map<string, any> => {
    const finalPayloadMap = new Map<string, any>();
    const { groups, buffs, getBuffThresholds } = useStore.getState();

    if (!groups.length || !buffs.length) {
      if (!groups.length) debugLog.info('No groups exist so no buff comparisons can be made.');
      if (!buffs.length) debugLog.info('No buffs are tracked so no buff comparisons can be made.');
      return finalPayloadMap;
    }

    const foundBuffNames = new Set<string>();
    const foundBuffPayloads = new Map<string, any>();

    const buffGroupMap = new Map<string, Group>();

    for (const group of groups) {
      for (const buff of [...group.buffs, ...group.children]) {
        if (buff.name === "Blank") continue;
        buffGroupMap.set(buff.name, group);
      }
    }

    for (const detected of detectedBuffs) {
      for (const trackedBuff of buffs) {
        if (trackedBuff.name === 'Blank') continue;

        // Type filtering
        if (isDebuff && !['Debuff', 'Enemy Debuff'].includes(trackedBuff.buffType!)) continue;
        if (!isDebuff && !['Buff', 'Meta'].includes(trackedBuff.buffType!)) continue;

        // Image resolution (may be multiple for Meta)
        const imageKeys = trackedBuff.buffType === 'Meta'
          ? trackedBuff.childBuffNames?.filter(name => resolvedImages.has(name)) ?? []
          : [trackedBuff.name];

        for (const imageName of imageKeys) {
          const refImage = resolvedImages.get(imageName);
          if (!refImage) continue;

          const { passThreshold, failThreshold } = getBuffThresholds(trackedBuff.name);
          const match = detected.countMatch(refImage, false);

          if (match.passed >= passThreshold && match.failed <= failThreshold) {
            // The very first group should be named Debug in order to see live threshold data. Otherwise use the debug view.
            if (groups[0].name === "Debug") debugLog.verbose(`${trackedBuff.name} passed detection with ${match.passed} passed pixels and ${match.failed} failed pixels`);

            let payload;
            if (trackedBuff.buffType === 'Meta') {
              debugLog.verbose(`${trackedBuff.name} has found a matching buff.`);
              const group = buffGroupMap.get(trackedBuff.name);
              if (group) {
                debugLog.verbose(`${trackedBuff.name} is in the group "${group.name}".`);
                const child = group.children.find(child => child.name === imageName);
                debugLog.info(`${child?.name} is the buff that was matched`);
                if (child) {
                  foundBuffPayloads.set(trackedBuff.name, {
                    name: trackedBuff.name,
                    time: trackedBuff.timeRemaining,
                    cooldown: trackedBuff.cooldown,
                    imageData: trackedBuff.imageData,
                    desaturatedImageData: trackedBuff.desaturatedImageData,
                    childName: child?.name ?? 'NO CHILD MATCHED',
                    foundChild: {
                      name: child?.name ?? '',
                      time: child?.timeRemaining ?? 0,
                      imageData: child?.imageData ?? '',
                      scaledImageData: child?.scaledImageData ?? '',
                      desaturatedImageData: child?.desaturatedImageData ?? '',
                      scaledDesaturatedImageData: child?.scaledDesaturatedImageData ?? '',
                    },
                    defaultImageData: trackedBuff.defaultImageData,
                    hasAlerted: trackedBuff.hasAlerted
                  });
                }
              } 
            } else {
              debugLog.verbose(`${trackedBuff.name} has found a matching buff.`);
              const group = buffGroupMap.get(trackedBuff.name);
              if (group) {
                debugLog.verbose(`${trackedBuff.name} is in the group "${group.name}".`);
                payload = {
                  name: trackedBuff.name,
                  time: detected.readTime ? detected.readTime() : detected.time,
                  childName: 'NO CHILDREN',
                  cooldown: trackedBuff.cooldown,
                  imageData: trackedBuff.imageData,
                  scaledImageData: trackedBuff.scaledImageData,
                  desaturatedImageData: trackedBuff.desaturatedImageData,
                  scaledDesaturatedImageData: trackedBuff.scaledDesaturatedImageData,
                  defaultImageData: trackedBuff.defaultImageData,
                  hasAlerted: trackedBuff.hasAlerted,
                };
              }

            foundBuffNames.add(trackedBuff.name);
            foundBuffPayloads.set(trackedBuff.name, payload);
            break; // matched an image; no need to keep trying others
            }
          }
        }
      }

    // STEP 2: Compare found buffs with the store's known isActive state
    const allStoreBuffs = groups.flatMap(group => [...group.buffs, ...group.children]);

    for (const trackedBuff of allStoreBuffs) {
      if (trackedBuff.name === 'Blank') continue;

      const name = trackedBuff.name;
      const isActiveInStore = trackedBuff.isActive ?? false;
      const wasFound = foundBuffNames.has(name);

      if (wasFound && !isActiveInStore) {
        finalPayloadMap.set(name, {
          ...foundBuffPayloads.get(name),
          isActive: true,
        });
      } else if (!wasFound && isActiveInStore) {
        finalPayloadMap.set(name, {
          name,
          isActive: false,
        });
      }
    }
  }

    console.log(finalPayloadMap);
    return finalPayloadMap;
  }, []);

  return { calculateBuffUpdates };
}