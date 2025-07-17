import type { BuffInstance } from "../../types/Buff";
import { STATE_CHANGE_FLICKER_GUARD_MS } from "./constants";

export function processPermanentBuff(storeBuff: BuffInstance, foundPayload: BuffInstance, now: number, finalPayloadMap: Map<string, any>) {
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