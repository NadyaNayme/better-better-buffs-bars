import type { Buff } from "../types/Buff";
import type { Group } from "../types/Group";
import { debugLog } from "./debugLog";

export interface IdentifiedBuff extends Buff {
  name: string;
  time: number;
  childName: string;
  foundChild?: {
    name: string;
    time: number;
    imageData: string;
    scaledImageData: string;
    desaturatedImageData: string;
    scaledDesaturatedImageData: string;
  };
}

interface SyncResult {
  updatedGroups: Map<string, Group>;
  didChangeMap: Map<string, true>;
}

function buffsDidChange(prev: Buff[], next: Buff[]): boolean {
  if (prev.length !== next.length) {
    debugLog.verbose("Buff count changed");
    return true;
  }

  for (let i = 0; i < prev.length; i++) {
    const a = prev[i];
    const b = next[i];

    if (
      a.isActive !== b.isActive ||
      a.timeRemaining !== b.timeRemaining ||
      a.cooldownRemaining !== b.cooldownRemaining ||
      (a.buffType === 'Meta' && a.childName !== b.childName)
    ) {
      if (a.isActive !== b.isActive) debugLog.verbose(`${a.name} isActive changed`);
      if (a.timeRemaining !== b.timeRemaining) debugLog.verbose(`${a.name} timeRemaining changed`);
      return true;
    }
  }

  return false;
}

export function syncIdentifiedBuffsToGroups(
  groups: Group[],
  identifiedActiveBuffs: Map<string, IdentifiedBuff>
): SyncResult {
  const now = Date.now();
  const updatedGroups = new Map<string, Group>();
  const didChangeMap = new Map<string, true>();

  for (const group of groups) {

    // Step 1: Update normal buffs first
    const updatedBuffs: Buff[] = group.buffs.map((buff) => {
      if (buff.buffType === "Meta") return buff;

      const activeInfo = identifiedActiveBuffs.get(buff.name);
      let updated = { ...buff };

      if (activeInfo) {
        const shouldUpdate =
          (!buff.isActive || buff.timeRemaining !== activeInfo.time) ||
          (buff.cooldownRemaining && buff.cooldownRemaining !== 0);

        if (shouldUpdate) {
          updated = {
            ...updated,
            isActive: true,
            timeRemaining: activeInfo.time,
            cooldownRemaining: 0,
            lastUpdated: now,
          };
        }
      } else if (buff.isActive) {
        const elapsedMs = now - (buff.lastUpdated ?? now);
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        const timeLeft = buff.timeRemaining ?? 0;
        const newTime = Math.max(0, timeLeft - elapsedSeconds);

        if (!buff.isStack && newTime !== timeLeft) {
          updated = {
            ...updated,
            timeRemaining: newTime,
            isActive: newTime > 0,
            lastUpdated: now,
            cooldownRemaining: newTime === 0 ? buff.cooldown ?? 0 : buff.cooldownRemaining,
            hasAlerted: newTime === 0 ? false : buff.hasAlerted,
          };
        }
      }

      // Tick cooldown independently
      if (buff.cooldownRemaining && buff.cooldownRemaining > 0 && !buff.isStack) {
        const elapsedMs = now - (buff.lastUpdated ?? now);
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        const newCd = Math.max(0, buff.cooldownRemaining - elapsedSeconds);
        if (newCd !== buff.cooldownRemaining) {
          updated = {
            ...updated,
            cooldownRemaining: newCd,
            lastUpdated: now,
          };
        }
      }

      return updated;
    });

    // Step 2: Update Meta buffs using updated normal buffs
    const metaBuffsUpdated = updatedBuffs.map((buff) => {
        if (buff.buffType !== "Meta") return buff;
  
        const activeInfo = identifiedActiveBuffs.get(buff.name);
        const matchedChild = group.children.find(child =>
          child.name === activeInfo?.foundChild?.name
        );
  
        if (activeInfo || matchedChild) {
            return {
                ...buff,
                isActive: true,
                timeRemaining: matchedChild?.timeRemaining ?? 1,
                childName: matchedChild?.name ?? activeInfo?.childName ?? 'NO CHILD MATCHED',
                imageData: matchedChild?.imageData ?? '',
                desaturatedImageData: buff.defaultImageData ?? '',
                scaledImageData: matchedChild?.scaledImageData,
                scaledDesaturatedImageData: buff.defaultImageData,
                inactiveCount: 0,
                lastUpdated: now,
              };
        }
  
        return buff;
      });

      const shouldUpdate = buffsDidChange(group.buffs, updatedBuffs);
      const finalBuffs = metaBuffsUpdated;

      if (shouldUpdate) {
        didChangeMap.set(group.id, true);
        updatedGroups.set(group.id, {
          ...group,
          buffs: finalBuffs,
        });
      }
  }

  return {
    updatedGroups,
    didChangeMap,
  };
}