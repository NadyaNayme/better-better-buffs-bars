import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { processStackBuff } from '../processStackBuff';
import type { BuffInstance } from '../../../types/Buff';

describe('processStackBuff', () => {
  let now: number;
  let finalPayloadMap: Map<string, any>;
  let lastStackUpdateTimestamps: React.RefObject<Map<string | undefined, number>>;

  beforeEach(() => {
    now = Date.now();
    finalPayloadMap = new Map();
    lastStackUpdateTimestamps = { current: new Map() };
  });

  it('should set status Active and update stacks if new stacks > 0', () => {
    const storeBuff: BuffInstance = {
      name: 'TestBuff',
      type: 'StackBuff',
      stacks: 0,
      status: 'Inactive',
    } as BuffInstance;

    const foundPayload = {
      name: 'TestBuff',
      stacks: 3,
    };

    processStackBuff(storeBuff, foundPayload, now, finalPayloadMap, lastStackUpdateTimestamps);

    expect(finalPayloadMap.get('TestBuff')).toEqual({
      name: 'TestBuff',
      type: 'StackBuff',
      status: 'Active',
      stacks: 3,
      statusChangedAt: now,
      lastUpdated: now,
    });
  });

  it('should set status Inactive if foundPayload has 0 stacks', () => {
    const storeBuff: BuffInstance = {
      name: 'TestBuff',
      type: 'StackBuff',
      stacks: 5,
      status: 'Active',
    } as BuffInstance;

    const foundPayload = {
      name: 'TestBuff',
      stacks: 0,
    };

    processStackBuff(storeBuff, foundPayload, now, finalPayloadMap, lastStackUpdateTimestamps);

    expect(finalPayloadMap.get('TestBuff')).toEqual({
      name: 'TestBuff',
      type: 'StackBuff',
      status: 'Inactive',
      stacks: 0,
      statusChangedAt: now,
      lastUpdated: now,
    });
  });

  it('should not update if flicker guard is active and no major change', () => {
    const storeBuff: BuffInstance = {
      name: 'TestBuff',
      type: 'StackBuff',
      stacks: 2,
      status: 'Active',
    } as BuffInstance;

    const foundPayload = {
      name: 'TestBuff',
      stacks: 1,
    };

    lastStackUpdateTimestamps.current.set('TestBuff', now - 10);

    processStackBuff(storeBuff, foundPayload, now, finalPayloadMap, lastStackUpdateTimestamps);

    expect(finalPayloadMap.has('TestBuff')).toBe(false);
  });

  it('should update lastStackUpdateTimestamps when state changes', () => {
    const storeBuff: BuffInstance = {
      name: 'TestBuff',
      type: 'StackBuff',
      stacks: 0,
      status: 'Inactive',
    } as BuffInstance;

    const foundPayload = {
      name: 'TestBuff',
      stacks: 4,
    };

    processStackBuff(storeBuff, foundPayload, now, finalPayloadMap, lastStackUpdateTimestamps);

    expect(lastStackUpdateTimestamps.current.get('TestBuff')).toBe(now);
  });

  it('should not update if stacks and status are unchanged', () => {
    const storeBuff: BuffInstance = {
      name: 'TestBuff',
      type: 'StackBuff',
      stacks: 2,
      status: 'Active',
    } as BuffInstance;

    const foundPayload = {
      name: 'TestBuff',
      stacks: 2,
    };

    lastStackUpdateTimestamps.current.set('TestBuff', now - 1000);

    processStackBuff(storeBuff, foundPayload, now, finalPayloadMap, lastStackUpdateTimestamps);

    expect(finalPayloadMap.has('TestBuff')).toBe(false);
  });
});

export { processStackBuff };
