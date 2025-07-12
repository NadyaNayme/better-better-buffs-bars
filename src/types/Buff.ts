/**
 * Properties that are common across all buff and debuff types.
 */
interface BaseBuff {
  index: number;
  name: string;
  imageData: string;
  desaturatedImageData: string;
  thresholds: {
    fail: number;
    pass: number;
  };
  hasText: boolean;
  categories: string[];
}

const buffTypes = {
  NormalBuff: "Normal Buff",
  AbilityBuff: "Ability Buff",
  StackBuff: "Stack Buff",
  TargetDebuff: "Target Debuff",
  NormalDebuff: "Normal Debuff",
  WeaponSpecial: "Weapon Special",
  MetaBuff: "Meta Buff",
  PermanentBuff: "Permanent Buff"
} as const

type BuffType = keyof typeof buffTypes;

/**
 * Defines the different ways an alert can be triggered.
 */
type AlertCondition =
  | { condition: 'timeRemaining', threshold: number }
  | { condition: 'stacks', threshold: number }
  | { condition: 'onCooldownEnd' }
  | { condition: 'onActive' }
  | { condition: 'onInactive' };

interface Alertable {
  alert: AlertCondition & { hasAlerted?: boolean };
}

/**
 * A standard buff with a duration.
 * Example: Overloads, Antifire potions.
 */
export interface NormalBuff extends BaseBuff, Alertable {
  type: 'Normal Buff';
  timeRemaining: number;
  alert: { condition: 'timeRemaining'; threshold: number; hasAlerted?: boolean };
  hasText: true;
}

/**
 * A buff that accumulates in stacks.
 * Example: Necrosis stacks, Perfect Equilibrium stacks
 */
export interface StackBuff extends BaseBuff, Alertable {
  type: 'Stack Buff';
  stacks: number;
  alert: { condition: 'stacks'; threshold: number; hasAlerted?: boolean };
  hasText: true;
}

/**
 * A buff that comes from an ability, has a duration, and then a cooldown.
 * Example: Anticipation, Freedom.
 */
export interface AbilityBuff extends BaseBuff, Alertable {
  type: 'Ability Buff';
  timeRemaining: number;
  cooldown: number;
  cooldownStart: number | null;
  hasText: true;
}

/**
 * A standard debuff with a duration, found on the debuff bar.
 * Example: Stunned.
 */
export interface NormalDebuff extends BaseBuff, Alertable {
  type: 'Normal Debuff';
  timeRemaining: number;
  alert: { condition: 'onActive'; hasAlerted?: boolean };
  hasText: true;
}

/**
 * A debuff from a weapon special attack that alerts on expiration.
 * Example: Crystal Rain, Instability
 */
export interface WeaponSpecialDebuff extends BaseBuff, Alertable {
  type: 'Weapon Special';
  timeRemaining: number;
  alert: { condition: 'onInactive'; hasAlerted?: boolean };
  hasText: true;
}

/**
 * A buff or debuff that is either active or not, with no timer.
 * Example: Prayers, Life Points Boosted, Procs that go away when used (eg. Death Mark)
 */
export interface PermanentBuff extends BaseBuff, Alertable {
  type: 'Permanent Buff';
  hasText: false;
}

/**
 * A debuff that exists on targets.
 * Example: Death Mark, Bloat, Vulnerability
 */
export interface TargetDebuff extends BaseBuff, Alertable {
  type: 'Target Debuff';
  hasText: false;
}

/**
 * A special internal type to group other buffs.
 * It doesn't have its own duration but reflects the state of its children.
 */
export interface MetaBuff extends BaseBuff {
  type: 'Meta Buff';
  children: string[];
  activeChild: string | null;
  foundChild: Buff | null;
}

export type BuffConfig = {
  alert: AlertCondition & { hasAlerted?: boolean } | null;
  categories: string[] | null;
  children: string[] | null;
  cooldown: number | null;
  defaultImageData: string | null;
  desaturatedImageData: string;
  hasText: boolean | null;
  imageData: string;
  isUtility: boolean; /* Disables the Buff from being selected - is used internally, mostly for children of Meta buffs */
  name: string;
  thresholds: { fail: number; pass: number } | null;
  type: BuffType;
};

export interface BuffInstance extends BaseBuff {
  data: BuffConfig | null;
  type: BuffType;
  id: string;
  isActive: boolean;
  children: string[] | null;
  activeChild: string | null;
  foundChild: Buff | null;
  alert: null;
  hasAlerted: boolean;
  timeRemaining: number | null;
  cooldown: number | null;
  cooldownStart: number | null;
  defaultImageData: string | null;
  isUtility: boolean;
  scaledImageData: string | null;
  scaledDesaturatedImageData: string | null;
}

export type Buff = 
  | BuffInstance
  | BuffConfig
  | NormalBuff
  | StackBuff
  | AbilityBuff
  | NormalDebuff
  | WeaponSpecialDebuff
  | PermanentBuff
  | MetaBuff;


/* Discriminate that the Buff has been modified by the runtime */
export function isRuntimeBuff(buff: Buff | BuffInstance): buff is BuffInstance {
  if ('id' in buff) { 
    return true;
  } else { 
    console.error(`Type narrowing failed. Buff was not determined to be a runtime buff at runtime.`);
    return false;
  }
}