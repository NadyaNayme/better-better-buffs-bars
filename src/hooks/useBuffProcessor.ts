import { useRef } from 'react';
import useStore from '../store';
import { debugLog } from '../lib/debugLog';
import type { Group } from '../types/Group';
import { isRuntimeBuff, type BuffInstance, type BuffStatus } from '../types/Buff';

export function useBuffProcessor() {
    const lastChildMatchTimestamps = useRef(new Map<string, number>());
    const lastMatchedChildName = useRef(new Map<string, string>());
    const STACK_STATE_CHANGE_FLICKER_GUARD_MS = 500; 
    const STATE_CHANGE_FLICKER_GUARD_MS = 1000; 
    const matchedChildren = new Map<string, string>();
    const lastMetaUpdateTimestamps = useRef(new Map<string, number>());
    const lastStackUpdateTimestamps = useRef(new Map<string, number>());

    function processMetaBuff(
        storeBuff: BuffInstance,
        foundPayload: BuffInstance | undefined,
        now: number,
        finalPayloadMap: Map<string, any>,
        lastChildMatchTimestamps: React.RefObject<Map<string, number>>,
        lastMatchedChildName: React.RefObject<Map<string, string>>,
        buffMapByName: Map<string, any>,
        lastMetaUpdateTimestamps: React.RefObject<Map<string, number>>,
    ) {
        const META_BUFF_GRACE_PERIOD_MS = 1500;
        const META_BUFF_MIN_UPDATE_MS = 500;
    
        const {
            name,
            status: currentStatus,
            activeChild: currentActiveChild,
            statusChangedAt: currentStatusChangedAt
        } = storeBuff;
    
        const lastMatch = lastChildMatchTimestamps.current.get(name) ?? 0;
        const lastChange = lastMetaUpdateTimestamps.current.get(name) ?? 0;
        const timeSinceLastMatch = now - lastMatch;
        const timeSinceLastChange = now - lastChange;
    
        let nextStatus = currentStatus;
        let nextActiveChild = currentActiveChild;
        let nextImageData = storeBuff.imageData;
        let shouldUpdate = false;
    
        const matchedChild = foundPayload?.foundChild?.name ?? null;
    
        let payloadFoundChild = foundPayload?.foundChild ?? null;
    
        // --- Case A: Child was found ---
        if (matchedChild) {
            const isNewChild = matchedChild !== currentActiveChild;
            const shouldPromoteToActive = currentStatus !== 'Active';
    
            if ((isNewChild || shouldPromoteToActive) && timeSinceLastChange >= META_BUFF_MIN_UPDATE_MS) {
                nextStatus = 'Active';
                nextActiveChild = matchedChild;
                shouldUpdate = true;
    
                lastMetaUpdateTimestamps.current.set(name, now);
            }
    
            if (foundPayload?.foundChild?.imageData) {
                nextImageData = foundPayload.foundChild.imageData;
            }
    
            lastChildMatchTimestamps.current.set(name, now);
            lastMatchedChildName.current.set(name, matchedChild);
    
            payloadFoundChild = foundPayload?.foundChild as BuffInstance;
        }
        // --- Case B: No child match this tick, but last one was recent (within grace) ---
        else if (currentStatus === 'Active' && timeSinceLastMatch <= META_BUFF_GRACE_PERIOD_MS) {
            const fallbackChild = lastMatchedChildName.current.get(name);
            if (fallbackChild) {
                nextActiveChild = fallbackChild;
    
                const childData = buffMapByName.get(fallbackChild);
                if (childData?.imageData) {
                    nextImageData = childData.imageData;
                }
                payloadFoundChild = childData ?? null;  // <--- critical fix here
            }
            nextStatus = 'Active';
            shouldUpdate = false;  // prevent flicker
        }
        // --- Case C: No match for a while, deactivate ---
        else if (currentStatus === 'Active' && timeSinceLastMatch > META_BUFF_GRACE_PERIOD_MS && timeSinceLastChange >= META_BUFF_MIN_UPDATE_MS) {
            nextStatus = 'Inactive';
            nextActiveChild = null;
            nextImageData = storeBuff.defaultImageData ?? storeBuff.imageData;
            shouldUpdate = true;
    
            lastMatchedChildName.current.delete(name);
            lastChildMatchTimestamps.current.delete(name);
            lastMetaUpdateTimestamps.current.set(name, now);
    
            payloadFoundChild = null;
        }
    
        // --- Final payload assembly ---
        const payload = {
            name,
            status: nextStatus,
            activeChild: nextActiveChild,
            imageData: nextStatus === 'Active' ? nextImageData : (storeBuff.defaultImageData ?? storeBuff.imageData),
            lastUpdated: now,
            foundChild: payloadFoundChild,
            statusChangedAt: currentStatusChangedAt
        };
    
        if (nextStatus !== currentStatus || shouldUpdate || nextActiveChild !== currentActiveChild) {
            payload.statusChangedAt = now;
        }
    
        finalPayloadMap.set(name, payload);
    }

    function processAbilityBuff(
        storeBuff: BuffInstance,
        foundPayload: BuffInstance | undefined,
        now: number,
        finalPayloadMap: Map<string, any>
    ) {
        const {
            name,
            status: currentStatus,
            statusChangedAt = 0,
            guaranteedActiveUntil = 0,
            cooldownStart = 0,
            cooldown = 0,
            timeRemaining: currentTimeRemaining = 0,
        } = storeBuff;
    
        const statusAge = now - (statusChangedAt ?? 0);
        const cooldownRemaining = cooldownStart && cooldown
            ? Math.max(0, cooldown - Math.floor((now - cooldownStart) / 1000))
            : 0;
    
        let nextStatus: BuffStatus | null = currentStatus;
        let nextTimeRemaining = currentTimeRemaining;
        let nextCooldownStart = cooldownStart;
        let nextGuaranteedActiveUntil = guaranteedActiveUntil;
    
        const newTimeRemaining = foundPayload?.timeRemaining ?? 0;
        const isCooldownCapable = typeof cooldown === 'number' && cooldown > 0;
        const becameActive = currentStatus !== 'Active' && newTimeRemaining > 0;
    
        // --- Case 1: Buff becomes active ---
        if (becameActive && cooldownRemaining <= 0) {
            nextStatus = 'Active';
            nextTimeRemaining = newTimeRemaining;
            nextGuaranteedActiveUntil = now + newTimeRemaining * 1000;
            nextCooldownStart = 0;
        }
    
        // --- Case 2: Buff is still active ---
        else if (currentStatus === 'Active' && newTimeRemaining > 0) {
            nextStatus = 'Active';
            nextTimeRemaining = newTimeRemaining;
        }
    
        // --- Case 3: Buff should still be active due to guaranteedActiveUntil ---
        else if (currentStatus === 'Active' && newTimeRemaining === 0 && typeof guaranteedActiveUntil === 'number' && now < guaranteedActiveUntil) {
            nextStatus = 'Active';
            nextTimeRemaining = Math.round((guaranteedActiveUntil - now) / 1000);
        }
    
        // --- Case 4: Buff just ended and is ready for cooldown ---
        else if (
            currentStatus === 'Active' &&
            newTimeRemaining === 0 &&
            typeof guaranteedActiveUntil === 'number' &&
            now >= guaranteedActiveUntil &&
            statusAge > STATE_CHANGE_FLICKER_GUARD_MS
        ) {
            if (isCooldownCapable) {
                nextStatus = 'OnCooldown';
                nextCooldownStart = now;
            } else {
                nextStatus = 'Inactive';
                nextCooldownStart = 0;
            }
    
            nextTimeRemaining = 0;
            nextGuaranteedActiveUntil = 0;
        }
    
        // --- Case 5: Cooldown just finished ---
        else if (currentStatus === 'OnCooldown' && cooldownRemaining <= 0) {
            nextStatus = 'Inactive';
            nextTimeRemaining = 0;
            nextCooldownStart = 0;
        }
    
        // --- Case 6: Stay in OnCooldown ---
        else if (currentStatus === 'OnCooldown') {
            nextStatus = 'OnCooldown';
        }
    
        // --- Final Payload Assembly ---
        const finalPayload = {
            name,
            status: nextStatus,
            timeRemaining: nextStatus === 'Active' ? nextTimeRemaining : 0,
            cooldownStart: nextCooldownStart,
            guaranteedActiveUntil: nextGuaranteedActiveUntil,
            lastUpdated: now,
            statusChangedAt
        };
    
        if (nextStatus !== currentStatus) {
            finalPayload.statusChangedAt = now;
        }
    
        finalPayloadMap.set(name, finalPayload);
    }
    
    function processStackBuff(
        storeBuff: BuffInstance,
        foundPayload: BuffInstance | undefined,
        now: number,
        finalPayloadMap: Map<string, any>,
        lastStackUpdateTimestamps: React.RefObject<Map<string, number>>
      ) {
        const { name, stacks: currentStacks = 0, status: currentStatus } = storeBuff;
      
        const newStacks = typeof foundPayload?.stacks === 'number' ? foundPayload.stacks : 0;
        const shouldBeActive = newStacks > 0;
        const newStatus = shouldBeActive ? 'Active' : 'Inactive';
      
        if (storeBuff.type === 'StackBuff') {
          const lastUpdate = lastStackUpdateTimestamps.current.get(name) ?? 0;
          const timeSinceLast = now - lastUpdate;
      
          if (
            timeSinceLast < STACK_STATE_CHANGE_FLICKER_GUARD_MS &&
            (newStatus !== currentStatus || newStacks !== currentStacks)
          ) {
            return;
          }
          lastStackUpdateTimestamps.current.set(name, now);
        }
      
        if (newStacks !== currentStacks || newStatus !== currentStatus) {
          finalPayloadMap.set(name, {
            name,
            type: storeBuff.type,
            status: newStatus,
            stacks: newStacks,
            statusChangedAt: now,
            lastUpdated: now,
          });
        }
      }
    
      function processNormalBuff(
        storeBuff: BuffInstance, 
        foundPayload: BuffInstance | undefined, 
        now: number, 
        finalPayloadMap: Map<string, any>
    ) {
        const { 
            name, 
            timeRemaining: currentTimeRemaining = 0, 
            status: currentStatus,
            guaranteedActiveUntil = 0
        } = storeBuff;
    
        let nextTimeRemaining = currentTimeRemaining;
        let nextGuaranteedActiveUntil = guaranteedActiveUntil;
        let nextStatus: BuffStatus | null = currentStatus;
    
        // Update timeRemaining from foundPayload if available
        if (foundPayload) {
            const newTimeRemaining = foundPayload.timeRemaining ?? 0;
            const timeDifference = Math.abs((currentTimeRemaining ?? 0) - newTimeRemaining);
    
            if (timeDifference >= 3 || newTimeRemaining < (currentTimeRemaining ?? 0)) {
                nextTimeRemaining = newTimeRemaining;
    
                // Update guarantee if active time remaining is refreshed
                if (newTimeRemaining > 0) {
                    nextGuaranteedActiveUntil = now + newTimeRemaining * 1000;
                }
            }
        }
    
        // Decide status transitions based on timeRemaining and guarantee
        if (typeof nextTimeRemaining === 'number' && nextTimeRemaining > 0) {
            // Buff should be active, whether it was inactive or already active
            nextStatus = 'Active';
            if (typeof nextGuaranteedActiveUntil === 'number' && nextGuaranteedActiveUntil < now + nextTimeRemaining * 1000) {
                // Extend guaranteedActiveUntil if new timeRemaining is longer
                nextGuaranteedActiveUntil = now + nextTimeRemaining * 1000;
            }
        } else {
            // timeRemaining is zero or less
            if (typeof guaranteedActiveUntil === 'number' && guaranteedActiveUntil > now) {
                // Still within guarantee period, keep active with estimated timeRemaining
                nextStatus = 'Active';
                nextTimeRemaining = Math.round((guaranteedActiveUntil - now) / 1000);
            } else {
                // Guarantee expired, deactivate
                nextStatus = 'Inactive';
                nextTimeRemaining = 0;
                nextGuaranteedActiveUntil = 0;
            }
        }
    
        // Prepare final payload
        const finalPayload: any = {
            name,
            status: nextStatus,
            timeRemaining: nextStatus === 'Active' ? nextTimeRemaining : 0,
            guaranteedActiveUntil: nextGuaranteedActiveUntil,
            lastUpdated: now,
        };
    
        if (nextStatus !== currentStatus) {
            finalPayload.statusChangedAt = now;
        }
    
        finalPayloadMap.set(name, finalPayload);
    }

    function processPermanentBuff(storeBuff: BuffInstance, foundPayload: BuffInstance, now: number, finalPayloadMap: Map<string, any>) {
        const { name, status: currentStatus, statusChangedAt } = storeBuff;

        const wasPreviouslyActive = currentStatus === 'Active';
        const statusAge = now - (statusChangedAt ?? 0);

        const shouldBeActive = Boolean(foundPayload);

        // BECOMES ACTIVE FROM INACTIVE
        if (shouldBeActive && !wasPreviouslyActive) {
            finalPayloadMap.set(name, {
                name,
                status: 'Active',
                statusChangedAt: now,
                cooldownStart: 0,
                lastUpdated: now,
            });
        }
        // BECOMES INACTIVE FROM ACTIVE
        else if (!shouldBeActive && wasPreviouslyActive && statusAge > STATE_CHANGE_FLICKER_GUARD_MS) {
            finalPayloadMap.set(name, {
                name,
                status: 'Inactive',
                statusChangedAt: now,
                lastUpdated: now,
            });
        }
        // STAYS ACTIVE
        else if (shouldBeActive && wasPreviouslyActive) {
            finalPayloadMap.set(name, {
                name,
                status: 'Active',
                lastUpdated: now,
            });
        }
    }

    function processNormalDebuff(
        storeBuff: BuffInstance, 
        foundPayload: BuffInstance | undefined, 
        now: number, 
        finalPayloadMap: Map<string, any>
    ) {
        const { 
            name, 
            timeRemaining: currentTimeRemaining = 0, 
            status: currentStatus,
            guaranteedActiveUntil = 0
        } = storeBuff;
    
        let nextTimeRemaining = currentTimeRemaining;
        let nextGuaranteedActiveUntil = guaranteedActiveUntil;
        let nextStatus: BuffStatus | null = currentStatus;
    
        // Update timeRemaining from foundPayload if available
        if (foundPayload) {
            const newTimeRemaining = foundPayload.timeRemaining ?? 0;
            const timeDifference = Math.abs((currentTimeRemaining ?? 0) - newTimeRemaining);
    
            if (timeDifference >= 3 || newTimeRemaining < (currentTimeRemaining ?? 0)) {
                nextTimeRemaining = newTimeRemaining;
    
                // Update guarantee if active time remaining is refreshed
                if (newTimeRemaining > 0) {
                    nextGuaranteedActiveUntil = now + newTimeRemaining * 1000;
                }
            }
        }
    
        // Decide status transitions based on timeRemaining and guarantee
        if (typeof nextTimeRemaining === 'number' && nextTimeRemaining > 0) {
            // Buff should be active, whether it was inactive or already active
            nextStatus = 'Active';
            if (typeof nextGuaranteedActiveUntil === 'number' && nextGuaranteedActiveUntil < now + nextTimeRemaining * 1000) {
                // Extend guaranteedActiveUntil if new timeRemaining is longer
                nextGuaranteedActiveUntil = now + nextTimeRemaining * 1000;
            }
        } else {
            // timeRemaining is zero or less
            if (typeof guaranteedActiveUntil === 'number' && guaranteedActiveUntil > now) {
                // Still within guarantee period, keep active with estimated timeRemaining
                nextStatus = 'Active';
                nextTimeRemaining = Math.round((guaranteedActiveUntil - now) / 1000);
            } else {
                // Guarantee expired, deactivate
                nextStatus = 'Inactive';
                nextTimeRemaining = 0;
                nextGuaranteedActiveUntil = 0;
            }
        }
    
        // Prepare final payload
        const finalPayload: any = {
            name,
            status: nextStatus,
            timeRemaining: nextStatus === 'Active' ? nextTimeRemaining : 0,
            guaranteedActiveUntil: nextGuaranteedActiveUntil,
            lastUpdated: now,
        };
    
        if (nextStatus !== currentStatus) {
            finalPayload.statusChangedAt = now;
        }
    
        finalPayloadMap.set(name, finalPayload);
    }

    function processWeaponSpecialDebuff(storeBuff: BuffInstance, foundPayload: BuffInstance, now: number, finalPayloadMap: Map<string, any>) {
        const { name , timeRemaining: currentTimeRemaining, status: currentStatus, statusChangedAt } = storeBuff;

        const wasPreviouslyActive = currentStatus === 'Active';
        const statusAge = now - (statusChangedAt ?? 0);

        const newTimeRemaining = foundPayload?.timeRemaining ?? 0;
        const shouldBeActive = newTimeRemaining > 0;

        // BECOMES ACTIVE FROM INACTIVE
        if (shouldBeActive && !wasPreviouslyActive && currentTimeRemaining === 0) {
            finalPayloadMap.set(name, {
                name,
                status: 'Active',
                timeRemaining: newTimeRemaining,
                statusChangedAt: now,
                cooldownStart: 0,
                lastUpdated: now,
            });
        }
        // BECOMES INACTIVE FROM ACTIVE
        else if (!shouldBeActive && wasPreviouslyActive && statusAge > STATE_CHANGE_FLICKER_GUARD_MS) {
            finalPayloadMap.set(name, {
                name,
                status: 'Inactive',
                statusChangedAt: now,
                timeRemaining: 0,
                lastUpdated: now,
            });
        }
        // STAYS ACTIVE
        else if (shouldBeActive && wasPreviouslyActive) {
            finalPayloadMap.set(name, {
                name,
                status: 'Active',
                timeRemaining: newTimeRemaining,
                lastUpdated: now,
            });
        }
    }

    const calculateBuffUpdates = 
        (detectedBuffs: any[], resolvedImages: Map<string, any>, isDebuff: boolean): Map<string, any> => {
            const finalPayloadMap = new Map<string, any>();
            const { groups, buffs, getBuffThresholds } = useStore.getState();

            if (!groups.length || !buffs.length) {
                if (!groups.length) debugLog.info('No groups exist so no buff comparisons can be made.');
                if (!buffs.length) debugLog.info('No buffs are tracked so no buff comparisons can be made.');
                return finalPayloadMap;
            }

            const foundBuffPayloads = new Map<string, any>();

            const buffGroupMap = new Map<string, Group>();
            for (const group of groups) {
                for (const buff of [...group.buffs, ...group.children]) {
                    if (buff.name === 'Blank') continue;
                    buffGroupMap.set(buff.name, group);
                }
            }

            const now = Date.now();

            for (const detected of detectedBuffs) {
                for (const trackedBuff of buffs) {
                    if (!isRuntimeBuff(trackedBuff)) continue;
                    if (trackedBuff.name === 'Blank') continue;
                    if (
                        isDebuff &&
                        (trackedBuff.type === 'NormalBuff' ||
                            trackedBuff.type === 'AbilityBuff' ||
                            trackedBuff.type === 'StackBuff' ||
                            trackedBuff.type === 'PermanentBuff')
                    )
                        continue;
                    if (!isDebuff && (trackedBuff.type === 'NormalDebuff' || trackedBuff.type === 'WeaponSpecial'))
                        continue;

                    const imageKeys =
                        trackedBuff.type === 'MetaBuff'
                            ? (trackedBuff.children?.filter((name) => resolvedImages.has(name)) ?? [])
                            : [trackedBuff.name];

                    for (const imageName of imageKeys) {
                        const refImage = resolvedImages.get(imageName);
                        if (!refImage) continue;

                        const { pass, fail } = getBuffThresholds(trackedBuff.name);
                        const match = detected.countMatch(refImage, false);

                        let payload;
                        if (match.passed >= pass && match.failed <= fail) {
                            const group = buffGroupMap.get(trackedBuff.name);
                            const child = group?.children.find((c) => c.name === imageName);

                            switch (trackedBuff.type) {
                                case 'MetaBuff':
                                    if (child && isRuntimeBuff(child)) {
                                        matchedChildren.set(trackedBuff.name, child.name);
                                        lastChildMatchTimestamps.current.set(trackedBuff.name, now);
                                        lastMatchedChildName.current.set(trackedBuff.name, child.name);
    
                                        payload = {
                                            name: trackedBuff.name,
                                            type: trackedBuff.type,
                                            status: 'Active',
                                            childName: child.name,
                                            imageData: child.scaledImageData ?? child.imageData,
                                            desaturatedImageData: child.scaledDesaturatedImageData ?? child.desaturatedImageData,
                                            foundChild: {
                                                name: child.name,
                                                imageData: child.scaledImageData ?? child.imageData,
                                                desaturatedImageData: child.scaledDesaturatedImageData ?? child.desaturatedImageData,
                                            },
                                            lastUpdated: now,
                                        };
                                    }
                                    break;
                                case 'StackBuff':
                                    payload = {
                                        name: trackedBuff.name,
                                        type: trackedBuff.type,
                                        status: detected.readTime() > 0 ? 'Active' : 'Inactive',
                                        stacks: detected.readTime() ? detected.readTime() : null,
                                        lastUpdated: now,
                                    };
                                    break;
                                case 'AbilityBuff':
                                case 'NormalBuff':
                                case 'NormalDebuff':   
                                case 'WeaponSpecial':
                                    payload = {
                                        name: trackedBuff.name,
                                        type: trackedBuff.type,
                                        status: 'Active',
                                        timeRemaining: detected.readTime() ? detected.readTime() : null,
                                        lastUpdated: now,
                                    };
                                    break;
                                case 'PermanentBuff':
                                    payload = {
                                        name: trackedBuff.name,
                                        type: trackedBuff.type,
                                        status: 'Active',
                                        lastUpdated: now,
                                    };
                                    break;
                            }

                            if (payload) {
                                foundBuffPayloads.set(trackedBuff.name, payload);
                            }

                            break;
                        }
                    }
                }
            }

            const allStoreBuffs = groups.flatMap((group) => [...group.buffs, ...group.children]);

            for (const storeBuff of allStoreBuffs) {
                if (!isRuntimeBuff(storeBuff) || storeBuff.name === 'Blank') continue;

                const foundPayload = foundBuffPayloads.get(storeBuff.name);
                const now = Date.now();

                switch (storeBuff.type) {
                    case 'MetaBuff':
                        processMetaBuff(storeBuff, foundPayload, now, finalPayloadMap, lastChildMatchTimestamps, lastMatchedChildName, buffGroupMap, lastMetaUpdateTimestamps);
                        break;
                    case 'AbilityBuff':
                        processAbilityBuff(storeBuff, foundPayload, now, finalPayloadMap);
                        break;
                    case 'NormalBuff':
                        processNormalBuff(storeBuff, foundPayload, now, finalPayloadMap);
                        break;
                    case 'NormalDebuff':
                        processNormalDebuff(storeBuff, foundPayload, now, finalPayloadMap);
                        break;
                    case 'PermanentBuff':
                        processPermanentBuff(storeBuff, foundPayload, now, finalPayloadMap);
                        break;
                    case 'StackBuff':
                        processStackBuff(storeBuff, foundPayload, now, finalPayloadMap, lastStackUpdateTimestamps);
                        break;
                    case 'WeaponSpecial':
                        processWeaponSpecialDebuff(storeBuff, foundPayload, now, finalPayloadMap);
                        break;
                }
            }

            if (finalPayloadMap.size > 0) {
              const payloadsToLog = Object.fromEntries(finalPayloadMap);
              debugLog.verbose(`Final Payloads to be sent (size: ${finalPayloadMap.size}):`, payloadsToLog);
            }

            return finalPayloadMap;
        }
        
    return { calculateBuffUpdates };
}
