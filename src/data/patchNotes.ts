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
    version: "v0.4.1",
    date: "2025-07-18",
    title: "That's alarming...",
    added: [
      `Alert settings now have toggles to enable / disable individual alerts`,
      `Lily has been added as an option for the alert voice.`,
    ],
    fixes: [
      `Buff processing has undergone yet another underhaul & rewrite and major flickering should finally be gone.`,
    ],
    highlights: null,
    errors: null,
    knownIssues: [
      `When BBB loses track of a buff, say Overloads when they start their 10s flashing cooldown, the buff lingers at the last read value. There are plans to fix this.`,
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