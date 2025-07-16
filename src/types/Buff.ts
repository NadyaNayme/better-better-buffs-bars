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

export type BuffStatus = 'Active' | 'OnCooldown' | 'Inactive';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  | "timeRemaining"
  | "stacks"
  | "onCooldownEnd"
  | "onActive"
  | "onInactive";

/**
 * A standard buff with a duration.
 * Example: Overloads, Antifire potions.
 */
export interface NormalBuff extends BaseBuff {
  type: 'NormalBuff';
  timeRemaining: number;
  alert: { condition: 'timeRemaining'; threshold: number; hasAlerted?: boolean };
  hasText: true;
}

/**
 * A buff that accumulates in stacks.
 * Example: Necrosis stacks, Perfect Equilibrium stacks
 */
export interface StackBuff extends BaseBuff {
  type: 'StackBuff';
  stacks: number;
  alert: { condition: 'stacks'; threshold: number; hasAlerted?: boolean };
  hasText: true;
}

/**
 * A buff that comes from an ability, has a duration, and then a cooldown.
 * Example: Anticipation, Freedom.
 */
export interface AbilityBuff extends BaseBuff {
  type: 'AbilityBuff';
  timeRemaining: number;
  cooldown: number;
  cooldownStart: number | null;
  hasText: true;
}

/**
 * A standard debuff with a duration, found on the debuff bar.
 * Example: Stunned.
 */
export interface NormalDebuff extends BaseBuff {
  type: 'NormalDebuff';
  timeRemaining: number;
  alert: { condition: 'onActive'; hasAlerted?: boolean };
  hasText: true;
}

/**
 * A debuff from a weapon special attack that alerts on expiration.
 * Example: Crystal Rain, Instability
 */
export interface WeaponSpecialDebuff extends BaseBuff {
  type: 'WeaponSpecial';
  timeRemaining: number;
  alert: { condition: 'onInactive'; hasAlerted?: boolean };
  hasText: true;
}

/**
 * A buff or debuff that is either active or not, with no timer.
 * Example: Prayers, Life Points Boosted, Procs that go away when used (eg. Death Mark)
 */
export interface PermanentBuff extends BaseBuff {
  type: 'PermanentBuff';
  hasText: false;
}

/**
 * A debuff that exists on targets.
 * Example: Death Mark, Bloat, Vulnerability
 */
export interface TargetDebuff extends BaseBuff {
  type: 'TargetDebuff';
  hasText: false;
}

/**
 * A special internal type to group other buffs.
 * It doesn't have its own duration but reflects the state of its children.
 */
export interface MetaBuff extends BaseBuff {
  type: 'MetaBuff';
  children: string[];
  activeChild: string | null;
  foundChild: Buff | null;
}

export type BuffConfig = {
  alert: { condition: AlertCondition; threshold: number; hasAlerted: boolean | null } | null;
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
  alert: { condition: AlertCondition; threshold: number; hasAlerted: boolean | null } | null;
  data: BuffConfig | null;
  type: BuffType;
  id: string;
  status: BuffStatus | null;
  statusChangedAt: number | null;
  children: string[] | null;
  activeChild: string | null;
  foundChild: Buff | BuffInstance | Partial<BuffInstance> | null;
  timeRemaining: number | null;
  guaranteedActiveUntil: number | null;
  stacks: number | null;
  cooldown: number | null;
  cooldownStart: number | null;
  defaultImageData: string | null;
  isUtility: boolean;
  scaledImageData: string | null;
  scaledDesaturatedImageData: string | null;
  lastUpdated: number | null;
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
export function isRuntimeBuff(buff: Buff | BuffInstance | Partial<BuffInstance>): buff is BuffInstance {
  if ('id' in buff) { 
    return true;
  } else { 
    console.error(`Type narrowing failed. Buff was not determined to be a runtime buff at runtime.`);
    return false;
  }
}