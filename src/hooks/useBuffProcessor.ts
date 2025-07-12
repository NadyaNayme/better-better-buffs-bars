import { useCallback } from 'react';
import useStore from '../store';
import { debugLog } from '../lib/debugLog';
import type { Group } from '../types/Group';
import { isRuntimeBuff } from '../types/Buff';

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
        if (!isRuntimeBuff(trackedBuff)) continue;
        if (trackedBuff.name === 'Blank') continue;

        // Type filtering
        if (isDebuff && (trackedBuff.type === "NormalBuff" || trackedBuff.type === "AbilityBuff" || trackedBuff.type === "StackBuff" || trackedBuff.type === "PermanentBuff")) continue;
        if (!isDebuff && (trackedBuff.type === "NormalDebuff" || trackedBuff.type === "WeaponSpecial")) continue;

        const imageKeys = trackedBuff.type === 'MetaBuff'
          ? trackedBuff.children?.filter(name => resolvedImages.has(name)) ?? []
          : [trackedBuff.name];

        for (const imageName of imageKeys) {
          const refImage = resolvedImages.get(imageName);
          if (!refImage) continue;

          const { pass, fail } = getBuffThresholds(trackedBuff.name);
          const match = detected.countMatch(refImage, false);

          if (match.passed >= pass && match.failed <= fail) {
            if (groups[0].name === "Debug") debugLog.verbose(`${trackedBuff.name} passed detection with ${match.passed} passed pixels and ${match.failed} failed pixels`);

            let payload;
            if (trackedBuff.type === 'MetaBuff') {
                const group = buffGroupMap.get(trackedBuff.name);
                if (group) {
                    const child = group.children.find(c => c.name === imageName);
                    if (group.name === "Debug") debugLog.info(`${child?.name ?? 'NO CHILD'} is the buff that was matched for MetaBuff ${trackedBuff.name}`);

                    // Create a payload for the MetaBuff REGARDLESS of whether a child is found.
                    // This ensures we can later detect the state change to "inactive" if no child is matched.
                    payload = {
                        name: trackedBuff.name,
                        type: trackedBuff.type,
                        childName: child?.name ?? 'NO CHILD MATCHED',
                        // Conditionally include full child data only if it exists
                        foundChild: child && isRuntimeBuff(child) ? {
                            name: child.name,
                            timeRemaining: child.timeRemaining,
                            imageData: child.imageData,
                            scaledImageData: child.scaledImageData,
                            desaturatedImageData: child.desaturatedImageData,
                            scaledDesaturatedImageData: child.scaledDesaturatedImageData,
                        } : null,
                    };
                }
            } else {
              const group = buffGroupMap.get(trackedBuff.name);
              if (group) {
                debugLog.verbose(`${trackedBuff.name} has found a matching buff in group "${group.name}".`);
                payload = {
                  name: trackedBuff.name,
                  type: trackedBuff.type,
                  timeRemaining: detected.readTime ? detected.readTime() : detected.time,
                  childName: 'NO CHILDREN',
                };
              }
            }

            if (payload) {
                foundBuffNames.add(trackedBuff.name);
                foundBuffPayloads.set(trackedBuff.name, payload);
            }
            break; // matched an image; no need to keep trying others
          }
        }
      }
    }

    // STEP 2: Compare found buffs with the store's known isActive state
    const allStoreBuffs = groups.flatMap(group => [...group.buffs, ...group.children]);

    for (const storeBuff of allStoreBuffs) {
      if (storeBuff.name === 'Blank' || !isRuntimeBuff(storeBuff)) continue;

      const name = storeBuff.name;
      const foundPayload = foundBuffPayloads.get(name);
      const isActiveInStore = storeBuff.isActive ?? false;

      // Case 1: The buff was found on screen.
      if (foundPayload) {
        const isMetaBuff = foundPayload.type === 'MetaBuff';
        let childDidChange = false;
        let shouldBeActive = true;

        if (isMetaBuff && foundPayload.childName === 'NO CHILD MATCHED') {
          shouldBeActive = false;
        }

        // Compare the correct properties: storeBuff.activeChild vs foundPayload.childName
        if (storeBuff.activeChild !== foundPayload.childName) {
          childDidChange = true;
        }

        if (shouldBeActive && !isActiveInStore) {
          // State Change: Inactive -> Active
          finalPayloadMap.set(name, {
            ...foundPayload,
            isActive: true,
            cooldownRemaining: 0,
            activeChild: foundPayload.childName, // Update the active child
          });
        } else if (!shouldBeActive && isActiveInStore) {
          // State Change: Active -> Inactive (e.g., MetaBuff lost its child)
          finalPayloadMap.set(name, {
            name: name,
            isActive: false,
            timeRemaining: 0,
            activeChild: null, // Clear the active child
          });
        } else {
          // State Change: Active -> Active (but data changed)
          finalPayloadMap.set(name, {
            ...foundPayload,
            isActive: true,
            activeChild: foundPayload.childName,
          });
        }
      }
      // Case 2: The buff was NOT found on screen, but it was active in the store.
      else if (isActiveInStore) {
        // State Change: Active -> Inactive
        const finalPayload: any = {
            name: name,
            isActive: false,
            timeRemaining: 0,
        };

        if (storeBuff.type !== 'MetaBuff') {
            finalPayload.cooldownRemaining = storeBuff.cooldown;
        }

        // If it was a MetaBuff, ensure its child state is cleared
        if (storeBuff.type === 'MetaBuff') {
            finalPayload.activeChild = null;
        }
        
        finalPayloadMap.set(name, finalPayload);
      }
    }

    if (finalPayloadMap.keys.length > 0) {
      debugLog.info('Final Payloads to be sent:', finalPayloadMap);
    }
    return finalPayloadMap;
  }, []);

  return { calculateBuffUpdates };
}