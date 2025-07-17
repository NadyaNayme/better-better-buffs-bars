import { describe, it, expect, beforeEach } from 'vitest';
import type { BuffInstance } from '../../../types/Buff';
import { processNormalBuff } from '../processNormalBuff';


// Logic is currently identical to NormalDebuffs & WeaponSpecialDebuffs
describe('processNormalBuff', () => {
  let now: number;
  let map: Map<string, any>;

  beforeEach(() => {
    now = Date.now();
    map = new Map();
  });

  it('activates buff from inactive when foundPayload has timeRemaining > 0', () => {
    const buff: Partial<BuffInstance> = {
      name: 'TestBuff',
      type: 'NormalBuff',
      status: 'Inactive',
      timeRemaining: 0,
      guaranteedActiveUntil: 0
    };

    const foundPayload: Partial<BuffInstance> = {
      name: 'TestBuff',
      type: 'NormalBuff',
      timeRemaining: 10
    };

    processNormalBuff(buff, foundPayload, now, map);
    const updated = map.get('TestBuff');

    expect(updated.status).toBe('Active');
    expect(updated.timeRemaining).toBe(10);
    expect(updated.guaranteedActiveUntil).toBeGreaterThan(now);
    expect(updated.statusChangedAt).toBe(now);
  });

  it('extends guaranteedActiveUntil if new timeRemaining is longer', () => {
    const buff: Partial<BuffInstance> = {
      name: 'TestBuff',
      type: 'NormalBuff',
      status: 'Active',
      timeRemaining: 5,
      guaranteedActiveUntil: now + 4000
    };

    const foundPayload: Partial<BuffInstance> = {
      name: 'TestBuff',
      type: 'NormalBuff',
      timeRemaining: 8
    };

    processNormalBuff(buff, foundPayload, now, map);
    const updated = map.get('TestBuff');

    expect(updated.status).toBe('Active');
    expect(updated.timeRemaining).toBe(8);
    expect(updated.guaranteedActiveUntil).toBeGreaterThan(now + 8000 - 10); // small delta
  });

  it('keeps buff active based on guaranteedActiveUntil if timeRemaining is 0', () => {
    const buff: Partial<BuffInstance> = {
      name: 'TestBuff',
      type: 'NormalBuff',
      status: 'Active',
      timeRemaining: 0,
      guaranteedActiveUntil: now + 5000
    };

    processNormalBuff(buff, undefined, now, map);
    const updated = map.get('TestBuff');

    expect(updated.status).toBe('Active');
    expect(updated.timeRemaining).toBeGreaterThan(0);
    expect(updated.guaranteedActiveUntil).toBe(now + 5000);
  });

  it('deactivates buff when timeRemaining is 0 and guarantee has expired', () => {
    const buff: Partial<BuffInstance> = {
      name: 'TestBuff',
      type: 'NormalBuff',
      status: 'Active',
      timeRemaining: 0,
      guaranteedActiveUntil: now - 1000
    };

    processNormalBuff(buff, undefined, now, map);
    const updated = map.get('TestBuff');

    expect(updated.status).toBe('Inactive');
    expect(updated.timeRemaining).toBe(0);
    expect(updated.guaranteedActiveUntil).toBe(0);
    expect(updated.statusChangedAt).toBe(now);
  });

  it('does not update statusChangedAt if status did not change', () => {
    const buff: Partial<BuffInstance> = {
      name: 'TestBuff',
      type: 'NormalBuff',
      status: 'Active',
      timeRemaining: 10,
      guaranteedActiveUntil: now + 10000
    };

    const foundPayload: Partial<BuffInstance> = {
      name: 'TestBuff',
      type: 'NormalBuff',
      timeRemaining: 10
    };

    processNormalBuff(buff, foundPayload, now, map);
    const updated = map.get('TestBuff');

    expect(updated.statusChangedAt).toBeUndefined();
  });
});