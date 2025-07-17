import type { BuffInstance, BuffStatus } from "../../types/Buff";

export function processNormalDebuff(
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