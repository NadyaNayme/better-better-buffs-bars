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