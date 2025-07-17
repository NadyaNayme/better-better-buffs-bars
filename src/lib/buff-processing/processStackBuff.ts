import type { BuffInstance } from "../../types/Buff";
import { STACK_STATE_CHANGE_FLICKER_GUARD_MS } from "./constants";

export function processStackBuff(
    storeBuff: BuffInstance | Partial<BuffInstance>,
    foundPayload: BuffInstance | Partial<BuffInstance> | undefined,
    now: number,
    finalPayloadMap: Map<string, any>,
    lastStackUpdateTimestamps: React.RefObject<Map<string | undefined, number>>
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
    
    if (name && newStacks !== currentStacks || name && newStatus !== currentStatus) {
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