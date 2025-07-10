import type { Buff } from "../types/Buff";
import type { Group } from "../types/Group";

export interface IdentifiedBuff {
  name: string;
  time: number;
  foundChild?: {
    name: string;
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
    if (prev.length !== next.length) return true;
  
    for (let i = 0; i < prev.length; i++) {
      const a = prev[i];
      const b = next[i];

      if (a.buffType === "Meta" && a.isActive !== b.isActive) {
        return true;
      }
  
      if (
        a.name !== b.name ||
        a.isActive !== b.isActive ||
        a.timeRemaining !== b.timeRemaining ||
        a.cooldownRemaining !== b.cooldownRemaining ||
        a.imageData !== b.imageData ||
        a.scaledImageData !== b.scaledImageData ||
        a.desaturatedImageData !== b.desaturatedImageData ||
        a.scaledDesaturatedImageData !== b.scaledDesaturatedImageData
      ) {
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
      
        if (activeInfo?.foundChild) {
          const found = group.children.find(
            (child) => child.name === activeInfo.foundChild!.name
          );
          if (!found) return buff;
      
          const isIdentical =
            buff.isActive === true &&
            buff.timeRemaining === activeInfo.time &&
            buff.imageData === found.imageData &&
            buff.childName === found.name &&
            buff.desaturatedImageData === found.desaturatedImageData &&
            buff.scaledImageData === found.scaledImageData &&
            buff.scaledDesaturatedImageData === found.scaledDesaturatedImageData;
      
          if (isIdentical) return buff;
      
          return {
            ...buff,
            isActive: true,
            timeRemaining: activeInfo.time,
            childName: found.name,
            imageData: found.imageData,
            desaturatedImageData: found.desaturatedImageData,
            scaledImageData: found.scaledImageData ?? "",
            scaledDesaturatedImageData: found.scaledDesaturatedImageData ?? "",
            inactiveCount: 0,
            lastUpdated: now,
          };
        }
      
        if (buff.isActive) {
          const timeSinceLastUpdate = now - (buff.lastUpdated ?? 0);
          if (timeSinceLastUpdate > 400) {
            const newInactiveCount = (buff.inactiveCount ?? 0) + 1;
      
            if (newInactiveCount >= 3) {
              return {
                ...buff,
                isActive: false,
                timeRemaining: 0,
                inactiveCount: 0,
                imageData: buff.defaultImageData ?? "",
                lastUpdated: now,
              };
            }
      
            return {
              ...buff,
              inactiveCount: newInactiveCount,
              lastUpdated: now,
            };
          }
        }
      
        return buff;
      });

    const shouldUpdate = buffsDidChange(group.buffs, metaBuffsUpdated);

    if (shouldUpdate) {
      didChangeMap.set(group.id, true);
      updatedGroups.set(group.id, { ...group, buffs: metaBuffsUpdated });
    }
  }

  return {
    updatedGroups,
    didChangeMap,
  };
}