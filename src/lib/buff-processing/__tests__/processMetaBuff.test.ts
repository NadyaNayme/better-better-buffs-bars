import { describe, it, expect, beforeEach } from 'vitest';
import type { BuffInstance } from '../../../types/Buff';
import { processMetaBuff } from '../processMetaBuff';

describe('processMetaBuff', () => {
  const now = Date.now();
  let finalPayloadMap: Map<string, any>;
  let lastChildMatchTimestamps: React.RefObject<Map<string, number>>;
  let lastMatchedChildName: React.RefObject<Map<string, string>>;
  let lastMetaUpdateTimestamps: React.RefObject<Map<string, number>>;
  let buffMapByName: Map<string, any>;

  beforeEach(() => {
    finalPayloadMap = new Map();
    lastChildMatchTimestamps = { current: new Map() };
    lastMatchedChildName = { current: new Map() };
    lastMetaUpdateTimestamps = { current: new Map() };
    buffMapByName = new Map();
  });

  it('should promote to Active with new child when matched and past min update delay', () => {
    const storeBuff: BuffInstance = {
      name: 'MetaBuff',
      status: 'Inactive',
      activeChild: null,
      statusChangedAt: now - 5000,
      imageData: 'base64old'
    } as BuffInstance;

    const foundPayload = {
      foundChild: {
        name: 'ChildA',
        imageData: 'base64new'
      }
    };

    processMetaBuff(
      storeBuff,
      foundPayload as any,
      now,
      finalPayloadMap,
      lastChildMatchTimestamps,
      lastMatchedChildName,
      buffMapByName,
      lastMetaUpdateTimestamps
    );

    const result = finalPayloadMap.get('MetaBuff');

    expect(result).toMatchObject({
      name: 'MetaBuff',
      status: 'Active',
      activeChild: 'ChildA',
      imageData: 'base64new',
      foundChild: { name: 'ChildA', imageData: 'base64new' },
      statusChangedAt: now
    });

    expect(lastChildMatchTimestamps.current.get('MetaBuff')).toBe(now);
    expect(lastMatchedChildName.current.get('MetaBuff')).toBe('ChildA');
  });

  it('should keep Active during grace period using last matched child', () => {
    const storeBuff: BuffInstance = {
      name: 'MetaBuff',
      status: 'Active',
      activeChild: 'ChildA',
      statusChangedAt: now - 2000,
      imageData: 'base64old'
    } as BuffInstance;

    lastChildMatchTimestamps.current.set('MetaBuff', now - 1000);
    lastMatchedChildName.current.set('MetaBuff', 'ChildA');
    buffMapByName.set('ChildA', { imageData: 'base64fallback' });

    processMetaBuff(
      storeBuff,
      undefined,
      now,
      finalPayloadMap,
      lastChildMatchTimestamps,
      lastMatchedChildName,
      buffMapByName,
      lastMetaUpdateTimestamps
    );

    const result = finalPayloadMap.get('MetaBuff');

    expect(result).toMatchObject({
      status: 'Active',
      activeChild: 'ChildA',
      imageData: 'base64fallback',
      statusChangedAt: storeBuff.statusChangedAt
    });
  });

  it('should deactivate after grace and update delay passes', () => {
    const storeBuff: BuffInstance = {
      name: 'MetaBuff',
      status: 'Active',
      activeChild: 'ChildA',
      statusChangedAt: now - 5000,
      imageData: 'img:active',
      defaultImageData: 'img:default'
    } as BuffInstance;

    lastChildMatchTimestamps.current.set('MetaBuff', now - 2000); // over grace
    lastMetaUpdateTimestamps.current.set('MetaBuff', now - 1000); // past min update

    processMetaBuff(
      storeBuff,
      undefined,
      now,
      finalPayloadMap,
      lastChildMatchTimestamps,
      lastMatchedChildName,
      buffMapByName,
      lastMetaUpdateTimestamps
    );

    const result = finalPayloadMap.get('MetaBuff');

    expect(result).toMatchObject({
      status: 'Inactive',
      activeChild: null,
      imageData: 'img:default',
      foundChild: null,
      statusChangedAt: now
    });

    expect(lastMatchedChildName.current.has('MetaBuff')).toBe(false);
    expect(lastChildMatchTimestamps.current.has('MetaBuff')).toBe(false);
  });

  it('should not update if status and activeChild remain the same and no conditions met', () => {
    const storeBuff: BuffInstance = {
      name: 'MetaBuff',
      status: 'Active',
      activeChild: 'ChildA',
      statusChangedAt: now - 1000,
      imageData: 'img:active'
    } as BuffInstance;

    lastChildMatchTimestamps.current.set('MetaBuff', now - 500); // within grace
    lastMetaUpdateTimestamps.current.set('MetaBuff', now - 300); // not enough for update

    // no foundPayload = no new match
    processMetaBuff(
      storeBuff,
      undefined,
      now,
      finalPayloadMap,
      lastChildMatchTimestamps,
      lastMatchedChildName,
      buffMapByName,
      lastMetaUpdateTimestamps
    );

    const result = finalPayloadMap.get('MetaBuff');

    expect(result.status).toBe('Active');
    expect(result.statusChangedAt).toBe(storeBuff.statusChangedAt);
  });
});