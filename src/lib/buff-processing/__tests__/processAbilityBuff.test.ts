import { describe, it, expect, beforeEach } from 'vitest';
import type { BuffInstance } from '../../../types/Buff';
import { STATE_CHANGE_FLICKER_GUARD_MS } from '../constants';
import { processAbilityBuff } from '../processAbilityBuff';

describe('processAbilityBuff', () => {
  let now: number;
  let finalPayloadMap: Map<string, any>;

  beforeEach(() => {
    now = Date.now();
    finalPayloadMap = new Map();
  });

  it('should enter Active when becoming active from Inactive and cooldown expired', () => {
    const storeBuff: BuffInstance = {
      name: 'TestAbility',
      status: 'Inactive',
      cooldown: 10,
      cooldownStart: 0,
      timeRemaining: 0,
      statusChangedAt: now - 10000,
      guaranteedActiveUntil: 0
    } as BuffInstance;

    const foundPayload: Partial<BuffInstance> = {
      timeRemaining: 5
    };

    processAbilityBuff(storeBuff, foundPayload, now, finalPayloadMap);

    expect(finalPayloadMap.get('TestAbility')).toMatchObject({
      name: 'TestAbility',
      status: 'Active',
      timeRemaining: 5,
      guaranteedActiveUntil: now + 5000,
      cooldownStart: 0,
      statusChangedAt: now
    });
  });

  it('should remain Active and refresh timeRemaining', () => {
    const storeBuff: BuffInstance = {
      name: 'TestAbility',
      status: 'Active',
      timeRemaining: 3,
      statusChangedAt: now - 3000,
      guaranteedActiveUntil: now + 2000
    } as BuffInstance;

    const foundPayload: Partial<BuffInstance> = {
      timeRemaining: 6
    };

    processAbilityBuff(storeBuff, foundPayload, now, finalPayloadMap);

    expect(finalPayloadMap.get('TestAbility')).toMatchObject({
      status: 'Active',
      timeRemaining: 6
    });
  });

  it('should stay Active due to guaranteedActiveUntil even if timeRemaining is 0', () => {
    const storeBuff: Partial<BuffInstance> = {
      name: 'TestAbility',
      status: 'Active',
      timeRemaining: 0,
      statusChangedAt: now - 4000,
      guaranteedActiveUntil: now + 4000
    };

    const foundPayload: Partial<BuffInstance> = { timeRemaining: 0 };

    processAbilityBuff(storeBuff, foundPayload, now, finalPayloadMap);

    expect(finalPayloadMap.get('TestAbility')).toMatchObject({
      status: 'Active',
      timeRemaining: Math.round((storeBuff.guaranteedActiveUntil! - now) / 1000)
    });
  });

  it('should enter OnCooldown after Active ends and guarantee expires', () => {
    const storeBuff: BuffInstance = {
      name: 'TestAbility',
      status: 'Active',
      timeRemaining: 0,
      statusChangedAt: now - STATE_CHANGE_FLICKER_GUARD_MS - 1,
      guaranteedActiveUntil: now - 1,
      cooldown: 10,
      cooldownStart: 0
    } as BuffInstance;

    const foundPayload: Partial<BuffInstance> = { timeRemaining: 0 };

    processAbilityBuff(storeBuff, foundPayload, now, finalPayloadMap);

    expect(finalPayloadMap.get('TestAbility')).toMatchObject({
      status: 'OnCooldown',
      cooldownStart: now,
      timeRemaining: 0,
      guaranteedActiveUntil: 0,
      statusChangedAt: now
    });
  });

  it('should not enter cooldown if flicker guard is still active', () => {
    const storeBuff: BuffInstance = {
      name: 'TestAbility',
      status: 'Active',
      timeRemaining: 0,
      statusChangedAt: now - 100,
      guaranteedActiveUntil: now - 1,
      cooldown: 10,
      cooldownStart: 0
    } as BuffInstance;

    const foundPayload: Partial<BuffInstance> = { timeRemaining: 0 };

    processAbilityBuff(storeBuff, foundPayload, now, finalPayloadMap);

    expect(finalPayloadMap.get('TestAbility').status).toBe('Active');
  });

  it('should exit OnCooldown when cooldownRemaining reaches 0', () => {
    const storeBuff: BuffInstance = {
      name: 'TestAbility',
      status: 'OnCooldown',
      cooldown: 5,
      cooldownStart: now - 5000,
      statusChangedAt: now - 6000
    } as BuffInstance;

    const foundPayload: Partial<BuffInstance> = { timeRemaining: 0 };

    processAbilityBuff(storeBuff, foundPayload, now, finalPayloadMap);

    expect(finalPayloadMap.get('TestAbility')).toMatchObject({
      status: 'Inactive',
      cooldownStart: 0,
      timeRemaining: 0,
      statusChangedAt: now
    });
  });

  it('should remain OnCooldown if cooldownRemaining > 0', () => {
    const storeBuff: BuffInstance = {
      name: 'TestAbility',
      status: 'OnCooldown',
      cooldown: 10,
      cooldownStart: now - 5000,
      statusChangedAt: now - 10000
    } as BuffInstance;

    const foundPayload: Partial<BuffInstance> = { timeRemaining: 0 };

    processAbilityBuff(storeBuff, foundPayload, now, finalPayloadMap);

    expect(finalPayloadMap.get('TestAbility')).toMatchObject({
      status: 'OnCooldown',
      cooldownStart: storeBuff.cooldownStart,
      statusChangedAt: storeBuff.statusChangedAt
    });
  });
});