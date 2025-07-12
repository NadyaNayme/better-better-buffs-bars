import { useCallback, useRef } from 'react';
import useStore from '../store';
import { debugLog } from '../lib/debugLog';
import type { Group } from '../types/Group';
import { isRuntimeBuff } from '../types/Buff';

export function useBuffProcessor() {
  const lastChildMatchTimestamps = useRef(new Map<string, number>());
  const lastMatchedChildName = useRef(new Map<string, string>());

  const calculateBuffUpdates = useCallback((
    detectedBuffs: any[],
    resolvedImages: Map<string, any>,
    isDebuff: boolean
  ): Map<string, any> => {
    const finalPayloadMap = new Map<string, any>();
    const { groups, buffs, getBuffThresholds } = useStore.getState();
    const allMetaChildren = new Set(
      buffs.filter((b) => b.type === 'MetaBuff')
           .flatMap((meta) => {
            if (!isRuntimeBuff(meta)) return []
            return meta.children ?? []
      })
    );

    if (!groups.length || !buffs.length) {
      if (!groups.length) debugLog.info('No groups exist so no buff comparisons can be made.');
      if (!buffs.length) debugLog.info('No buffs are tracked so no buff comparisons can be made.');
      return finalPayloadMap;
    }

    const foundBuffPayloads = new Map<string, any>();
    const matchedChildren = new Map<string, string>(); // MetaBuff.name -> childName

    const buffGroupMap = new Map<string, Group>();
    for (const group of groups) {
      for (const buff of [...group.buffs, ...group.children]) {
        if (buff.name === "Blank") continue;
        buffGroupMap.set(buff.name, group);
      }
    }

    const now = Date.now();

    for (const detected of detectedBuffs) {
      for (const trackedBuff of buffs) {
        if (!isRuntimeBuff(trackedBuff)) continue;
        if (trackedBuff.name === 'Blank') continue;

        if (allMetaChildren.has(trackedBuff.name) && trackedBuff.type !== 'MetaBuff') continue;
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
            let payload;
            const group = buffGroupMap.get(trackedBuff.name);
            const child = group?.children.find(c => c.name === imageName);

            if (trackedBuff.type === 'MetaBuff') {
              if (child && isRuntimeBuff(child)) {
                matchedChildren.set(trackedBuff.name, child.name);
                lastChildMatchTimestamps.current.set(trackedBuff.name, now);
                lastMatchedChildName.current.set(trackedBuff.name, child.name);

                payload = {
                  name: trackedBuff.name,
                  type: trackedBuff.type,
                  childName: child.name,
                  foundChild: {
                    ...child,
                  },
                };
              }
            } else {
              payload = {
                name: trackedBuff.name,
                type: trackedBuff.type,
                timeRemaining: detected.readTime() ? detected.readTime() : 0,
                childName: child?.name ? child.name : null,
              };
            }

            if (payload) {
              foundBuffPayloads.set(trackedBuff.name, payload);
            }

            break;
          }
        }
      }
    }

    const allStoreBuffs = groups.flatMap(group => [...group.buffs, ...group.children]);

    for (const storeBuff of allStoreBuffs) {
      if (!isRuntimeBuff(storeBuff) || storeBuff.name === 'Blank') continue;

      const name = storeBuff.name;
      const isMeta = storeBuff.type === 'MetaBuff';
      const wasPreviouslyActive = storeBuff.isActive ?? false;
      const foundPayload = foundBuffPayloads.get(name);

      let remaining = storeBuff.timeRemaining;
      let shouldBeActive = typeof remaining === 'number' ? remaining > 1 : false;
      let activeChildName: string | null = null;

      if (isMeta) {
        const lastMatchTime = lastChildMatchTimestamps.current.get(name) ?? 0;
        const lastChild = lastMatchedChildName.current.get(name) ?? null;

        if (now - lastMatchTime <= 3000 && lastChild) {
          shouldBeActive = true;
          activeChildName = lastChild;
        }
      } else if (foundPayload) {
        shouldBeActive = true;
      }

      if (shouldBeActive && !wasPreviouslyActive) {
        finalPayloadMap.set(name, {
          ...(foundPayload ?? { name }),
          isActive: true,
          cooldownStart: 0,
          activeChild: activeChildName,
        });
      } else if (!shouldBeActive && wasPreviouslyActive) {
        const payload: any = {
          name,
          isActive: false,
          timeRemaining: 0,
        };

        if (!isMeta) {
          if (!storeBuff.cooldownStart) {
            payload.cooldown = storeBuff.cooldown;
            payload.cooldownStart = Date.now();
          }
        } else {
          payload.activeChild = null;
          lastChildMatchTimestamps.current.delete(name);
          lastMatchedChildName.current.delete(name);
          matchedChildren.delete(name);
        }

        finalPayloadMap.set(name, payload);
      } else if (shouldBeActive && wasPreviouslyActive) {
        finalPayloadMap.set(name, {
          ...(foundPayload ?? { name }),
          isActive: true,
          activeChild: activeChildName,
        });
      }
    }

    if (finalPayloadMap.keys.length > 0) {
      debugLog.info('Final Payloads to be sent:', finalPayloadMap);
    }

    return finalPayloadMap;
  }, []);

  return { calculateBuffUpdates };
}