export interface PatchNote {
    version: string;
    date: string;
    title: string;
    errors: string[] | null;
    highlights: string[] | null;
    fixes: string[] | null;
    added: string[] | null;
    knownIssues: string[] | null;
  }
  
export const patchNotes: PatchNote[] = [
  {
    version: "v0.4.2",
    date: "2025-08-07",
    title: "Immersive Audio & More Buffs",
    added: [
      `Infinite Run, Thermal Ogre Flask, Elder Overload Salves, and Relentless have been added as trackable buffs.`,
      `There are now buttons to disable all alerts, disable all informative alerts, and disable all immersive alerts. For people who would rather enable only what they want to hear.`,
      `Chat reading has been implemented - allowing for far more combat-related alerts than what is possible with buff tracking alone.`,
    ],
    fixes: [
      `Alerts have been given slightly more descriptive labels.`
    ],
    highlights: [
      `Immersive audio triggers have been added for Telos & Nakatra fights. These audio alerts are disabled by default and must be enabled in the Alert Settings found in the Settings menu.`,
      `Groups now have a "Only Show Inactive" setting. If you don't see a buff - it is active. Useful for upkeep buffs that you don't want cluttering your screen (except to remind you to renew it!)`
    ],
    errors: null,
    knownIssues: [
      `Many alerts are still not implemented but are there to Preview & Enable/Disable. That way when they are implemented you can already have it configured how you want it.`
    ],
  },
  {
    version: "v0.4.1",
    date: "2025-07-19",
    title: "That's alerting...",
    added: [
      `Alert settings now have toggles to enable / disable individual alerts. Note: Not all alerts have been implemented quite yet...`,
      `You can now choose between Callum & Lily for the alert voices.`,
      `Individual groups can now hide outside of combat for those wanting a little more control.`,
      `The debugging console now has a search filter`,
    ],
    fixes: [
      `Buff processing has undergone yet another underhaul & rewrite and major flickering should finally be gone.`,
      `Stale buffs with 1-59s time remaining will now clear themselves after 10-15 seconds.`,
      `The UI is a little more colorful.`
    ],
    highlights: [
      `Whether you are considered to be "in combat" or not now also makes use of an active target nameplate instead of solely relying on changes to the player's HP, Adrenaline, or Prayer.`
    ],
    errors: null,
    knownIssues: [
      `Stale buffs with >1m time remaining are not cleared as I cannot tell '60' apart from '60' as that is all Alt1 sees when a buff has between 1:00 and 1:59 duration left. I could clear these after 2-3 minutes but that doesn't seem very helpful.`,
    ],
  },
  {
    version: "v0.4.0",
    date: "2025-07-14",
    title: "Dude, where's my settings?",
    added: [
      `Patch notes will now appear for updates. They can be viewed again at any time by clicking the Version Number in the Settings Panel. Totally not stolen from featfinder.net (legit website btw)`,
      `A draggable Debug console will now appear when Debug Mode is enabled to make everyone's lives a little easier.`,
      `You can now drag & drop buffs between groups.`
    ],
    fixes: [
      `Meta buffs have been re-enabled as they no longer cause rapid flickering when multiple groups are being used.`,
      `Cooldown tracking should be a little more graceful and no longer flicker due to rapid state changes.`,
      `Hiding overlays while out of combat no longer results in constant flickering from "inCombat" being set repeatedly from true->true or false->false.`,
      `Profiles now autosave with any user changes. Until this is battle-tested the manual override button will continue to exist.`
    ],
    errors: [
      `Your settings may have been reset. I'm terribly sorry. Data migration for Buffs was non-trivial - I tried to save what I could. You will need to toggle your Buffs off & on again for each group. Be sure "Hide overlays out of combat" is disabled if you are testing outside of combat.`
    ],
    knownIssues: [
      `When dragging between groups a placeholder for where it will be dropped isn't visible.`,
      `When dragging between groups and trying to drop at the end of another group it is placed second to last instead of last unless you drop it much further to the right.`
    ],
    highlights: null,
  },
  {
    version: "v0.3.3",
    date: "2025-07-11",
    title: "New Buffs!",
    added: [
      `You can now track Adrenaline Buffs (Meteor, Tsunami, Incendiary Shot)`,
      `You can now track Powders (all but Pulverising)`
    ],
    fixes: [
      `Buffs that are stacks (eg. Necrosis, Residual Souls) now properly go to 0 instead of freezing on the last known stack value.`
    ],
    highlights: null,
    knownIssues: null,
    errors: null,
  },
  {
    version: "v0.3.2",
    date: "2025-07-10",
    title: "Better Buff Selection!",
    added: [
      `Instead of a clunky dropdown you can now simply click the buffs you would like to track. I should have thought of that to begin with.`
    ],
    fixes: null,
    highlights: null,
    knownIssues: null,
    errors: null,
  },    
];