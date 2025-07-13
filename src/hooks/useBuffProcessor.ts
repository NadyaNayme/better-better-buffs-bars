import { useRef } from 'react';
import useStore from '../store';
import { debugLog } from '../lib/debugLog';
import type { Group } from '../types/Group';
import { isRuntimeBuff } from '../types/Buff';

export function useBuffProcessor() {
    const lastChildMatchTimestamps = useRef(new Map<string, number>());
    const lastMatchedChildName = useRef(new Map<string, string>());
    const META_BUFF_GRACE_PERIOD_MS = 3000;
    const STATE_CHANGE_FLICKER_GUARD_MS = 1000;
    const STUCK_STATE_TIMEOUT_MS = 2000;

    const calculateBuffUpdates = 
        (detectedBuffs: any[], resolvedImages: Map<string, any>, isDebuff: boolean): Map<string, any> => {
            const finalPayloadMap = new Map<string, any>();
            const { groups, buffs, getBuffThresholds } = useStore.getState();
            const allMetaChildren = new Set(
                buffs
                    .filter((b) => b.type === 'MetaBuff')
                    .flatMap((meta) => {
                        if (!isRuntimeBuff(meta)) return [];
                        return meta.children ?? [];
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
                    if (buff.name === 'Blank') continue;
                    buffGroupMap.set(buff.name, group);
                }
            }

            const now = Date.now();

            for (const detected of detectedBuffs) {
                for (const trackedBuff of buffs) {
                    if (!isRuntimeBuff(trackedBuff)) continue;
                    if (trackedBuff.name === 'Blank') continue;

                    if (allMetaChildren.has(trackedBuff.name) && trackedBuff.type !== 'MetaBuff') continue;
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

                            if (trackedBuff.type === 'MetaBuff') {
                                if (child && isRuntimeBuff(child)) {
                                    matchedChildren.set(trackedBuff.name, child.name);
                                    lastChildMatchTimestamps.current.set(trackedBuff.name, now);
                                    lastMatchedChildName.current.set(trackedBuff.name, child.name);

                                    payload = {
                                        name: trackedBuff.name,
                                        type: trackedBuff.type,
                                        status: 'Active',
                                        childName: child.name,
                                        foundChild: {
                                            ...child,
                                        },
                                        lastUpdated: Date.now(),
                                    };
                                }
                            } else {
                                payload = {
                                    name: trackedBuff.name,
                                    type: trackedBuff.type,
                                    status: 'Active',
                                    timeRemaining: detected.readTime() ? detected.readTime() : null,
                                    childName: child?.name ? child.name : null,
                                    lastUpdated: Date.now(),
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

            const allStoreBuffs = groups.flatMap((group) => [...group.buffs, ...group.children]);

            for (const storeBuff of allStoreBuffs) {
                if (!isRuntimeBuff(storeBuff) || storeBuff.name === 'Blank') continue;

                const name = storeBuff.name;
                const isMeta = storeBuff.type === 'MetaBuff';
                const wasPreviouslyActive = storeBuff.status === 'Active';
                const foundPayload = foundBuffPayloads.get(name);
                const cooldownRemaining =
                    storeBuff.cooldownStart && typeof storeBuff.cooldown === 'number'
                        ? Math.max(0, storeBuff.cooldown - Math.floor((now - storeBuff.cooldownStart) / 1000))
                        : 0;

                let remaining = storeBuff.timeRemaining;
                let shouldBeActive = typeof remaining === 'number' ? remaining >= 1 : false;
                let activeChildName: string | null = null;
                const statusAge = now - (storeBuff.statusChangedAt ?? 0);
                const stuckAt1 = storeBuff.status === 'Active' && storeBuff.timeRemaining === 1 && statusAge > STUCK_STATE_TIMEOUT_MS;

                if (isMeta) {
                    const lastMatchTime = lastChildMatchTimestamps.current.get(name) ?? 0;
                    const lastChild = lastMatchedChildName.current.get(name) ?? null;

                    if (now - lastMatchTime <= META_BUFF_GRACE_PERIOD_MS && lastChild) {
                        shouldBeActive = true;
                        activeChildName = lastChild;
                    }
                } else if (foundPayload) {
                    // Always take the fresh values
                    remaining = foundPayload.timeRemaining;
                    if (remaining === null) {
                        remaining = 0;
                    }
                    shouldBeActive = remaining > 0;
                }

                if (shouldBeActive && !wasPreviouslyActive && cooldownRemaining <= 0) {
                    finalPayloadMap.set(name, {
                        ...(foundPayload ?? { name }),
                        status: 'Active',
                        statusChangedAt: now,
                        cooldownStart: 0,
                        activeChild: activeChildName,
                        lastUpdated: now,
                    });
                } else if (!shouldBeActive && wasPreviouslyActive && statusAge > STATE_CHANGE_FLICKER_GUARD_MS) {
                    const payload: any = {
                        name,
                        status: 'Inactive',
                        statusChangedAt: now,
                        timeRemaining: 0,
                        lastUpdated: now,
                    };

                    if (!isMeta) {
                        if (!storeBuff.cooldownStart && cooldownRemaining <= 0) {
                            payload.cooldown = storeBuff.cooldown;
                            payload.status = 'Active';
                            payload.statusChangedAt = now;
                            payload.cooldownStart = 0;
                            payload.lastUpdated = now;
                        }
                    } else {
                        payload.activeChild = null;
                        payload.status = 'Inactive';
                        payload.statusChangedAt = now;
                        lastChildMatchTimestamps.current.delete(name);
                        lastMatchedChildName.current.delete(name);
                        matchedChildren.delete(name);
                    }

                    finalPayloadMap.set(name, payload);
                } else if (shouldBeActive && wasPreviouslyActive) {
                    finalPayloadMap.set(name, {
                        ...(foundPayload ?? { name }),
                        status: 'Active',
                        activeChild: activeChildName,
                        lastUpdated: now,
                    });
                }

                if (stuckAt1) {
                    let nextStatus;
                    if (typeof storeBuff.cooldown === 'number') {
                        nextStatus = 'OnCooldown';
                    }
                    finalPayloadMap.set(name, {
                        ...(foundPayload ?? { name }),
                        status: nextStatus === 'OnCooldown' ? nextStatus : 'Inactive',
                        cooldown: storeBuff.cooldown,
                        cooldownStart: nextStatus === 'OnCooldown' ? now : 0,
                        statusChangedAt: storeBuff.status !== nextStatus ? now : storeBuff.statusChangedAt,
                        lastUpdated: now,
                    });
                } else if (cooldownRemaining <= 0 && storeBuff.status === 'OnCooldown' && statusAge > 2000) {
                    finalPayloadMap.set(name, {
                        ...(foundPayload ?? { name }),
                        status: 'Inactive',
                        timeRemaining: 0,
                        cooldown: storeBuff.cooldown,
                        cooldownStart: 0,
                        statusChangedAt: now,
                        lastUpdated: now,
                    });
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
