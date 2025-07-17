import type { BuffInstance, BuffStatus } from "../../types/Buff";
import { STATE_CHANGE_FLICKER_GUARD_MS } from "./constants";

export function processAbilityBuff(
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