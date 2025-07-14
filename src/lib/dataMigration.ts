import { buffsData } from '../data/buffs';
import { v4 as uuidv4 } from 'uuid';

export function migrateOldStorageIfNeeded() {
  const NEW_KEY = "better-buffs-bars-storage";
  const OLD_KEY = "buff-tracker-storage";

  if (localStorage.getItem(NEW_KEY)) return;

  const oldRaw = localStorage.getItem(OLD_KEY);
  if (!oldRaw) return;

  try {
    const oldData = JSON.parse(oldRaw);
    if (!oldData?.state?.buffs) {
      console.warn("Invalid buff-tracker-storage format.");
      return;
    }

    const freshBuffMap = new Map(buffsData.map((buff) => [buff.name, buff]));

    const migratedBuffs = oldData.state.buffs.map((oldBuff: any, index: number) => {
      const fresh = freshBuffMap.get(oldBuff.name);
      if (!fresh) {
        console.warn(`⚠️ No matching fresh buff for "${oldBuff.name}", carrying over old data.`);
        return {
          ...oldBuff,
          id: oldBuff.id ?? uuidv4(),
          index,
        };
      }

      return {
        ...fresh,
        id: oldBuff.id ?? uuidv4(),
        index,
      };
    });

    const profileList: any[] = [];
    const oldProfiles = oldData.state.profiles ?? [];
    const seenGroupIds = new Set<string>();

    for (const oldProfile of oldProfiles) {
      const migratedGroups = (oldProfile.groups ?? []).map((group: any) => {
        const groupId = group.id ?? uuidv4();
        seenGroupIds.add(groupId);

        return {
          ...group,
          id: groupId,
          buffs: group.buffs ?? [],
          children: group.children ?? [],
          enabled: group.enabled ?? true,
          scale: group.scale ?? 100,
          buffsPerRow: group.buffsPerRow ?? 8,
          overlayPosition: group.overlayPosition ?? { x: 15, y: 15 },
        };
      });

      profileList.push({
        id: oldProfile.id ?? uuidv4(),
        name: oldProfile.name ?? "Unnamed Profile",
        groups: migratedGroups,
      });
    }

    // Handle legacy flat group fallback
    const legacyGroups = oldData.state.groups ?? [];
    const activeProfileName = oldData.state.profileName ?? oldData.state.lastActiveProfile ?? "Default";
    const existing = profileList.find(p => p.name === activeProfileName);

    const migratedLegacyGroups = legacyGroups
      .filter((group: any) => !seenGroupIds.has(group.id)) // dedup
      .map((group: any) => {
        const groupId = group.id ?? uuidv4();
        seenGroupIds.add(groupId);
        return {
          ...group,
          id: groupId,
          buffs: group.buffs ?? [],
          children: group.children ?? [],
          enabled: group.enabled ?? true,
          scale: group.scale ?? 100,
          buffsPerRow: group.buffsPerRow ?? 8,
          overlayPosition: group.overlayPosition ?? { x: 15, y: 15 },
        };
      });

    if (migratedLegacyGroups.length > 0) {
      if (existing) {
        existing.groups.push(...migratedLegacyGroups);
      } else {
        profileList.push({
          id: uuidv4(),
          name: activeProfileName,
          groups: migratedLegacyGroups,
        });
      }
    }

    const lastActiveProfile = activeProfileName;

    const migrated = {
      version: 0,
      state: {
        version: 0,
        buffs: migratedBuffs,
        groups: profileList.find(p => p.name === lastActiveProfile)?.groups ?? [],
        profileName: lastActiveProfile,
        lastActiveProfile,
        profiles: profileList,
      },
    };

    localStorage.setItem(NEW_KEY, JSON.stringify(migrated));
    console.info("✅ Buff Tracker multi-profile migration complete.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
}