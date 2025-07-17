import type { BuffInstance } from "../../types/Buff";

export function processMetaBuff(
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