export interface PatchNote {
    version: string;
    date: string;
    title: string;
    highlights?: string[];
    fixes?: string[];
    added?: string[];
  }
  
export const patchNotes: PatchNote[] = [
  {
    version: "v1.0.0",
    date: "2025-07-13",
    title: "Where did all my settings go?",
    added: [
      `Patch notes will now appear for updates. They can be viewed again at any time by clicking the Version Number in the Settings Panel.`
    ],
    fixes: [
      `Meta buffs have been re-enabled as they no longer cause flickering when multiple groups are in use.`,
      `Cooldown tracking should be a little more graceful and flicker less (no more 19->18->19->17->18->17)`,
      `Hiding overlays while out of combat no longer results in constant flickering from "inCombat" being set repeatedly from true->true or false->false.`,
      `Profiles now autosave with most changes to prevent accidentally forgetting to override. Until this is battle-tested the manual override button will continue to exist.`
    ],
    highlights: [
      `Due to a complete rewrite of how Profiles & Buffs work user settings have been lost.`
    ]
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
    ]
  },
  {
    version: "v0.3.2",
    date: "2025-07-10",
    title: "Better Buff Selection!",
    added: [
      `Instead of a clunky dropdown you can now simply click the buffs you would like to track. I should have thought of that to begin with.`
    ]
  },    
];