import { useRef } from 'react';
import useStore from '../store';
import { debugLog } from '../lib/debugLog';
import type { Group } from '../types/Group';
import { isRuntimeBuff } from '../types/Buff';
import { processAbilityBuff } from '../lib/buff-processing/processAbilityBuff';
import { processMetaBuff } from '../lib/buff-processing/processMetaBuff';
import { processNormalBuff } from '../lib/buff-processing/processNormalBuff';
import { processNormalDebuff } from '../lib/buff-processing/processNormalDebuff';
import { processPermanentBuff } from '../lib/buff-processing/processPermanentBuff';
import { processStackBuff } from '../lib/buff-processing/processStackBuff';
import { processWeaponSpecialDebuff } from '../lib/buff-processing/processWeaponSpecialDebuff';

export function useBuffProcessor() {
    const lastChildMatchTimestamps = useRef(new Map<string, number>());
    const lastMatchedChildName = useRef(new Map<string, string>());
    const matchedChildren = new Map<string, string>();
    const lastMetaUpdateTimestamps = useRef(new Map<string, number>());
    const lastStackUpdateTimestamps = useRef(new Map<string, number>());

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
