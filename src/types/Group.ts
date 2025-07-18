import type { Buff } from './Buff';
import type { Coordinates } from './Coordinates';

export interface Group {
    id: string;
    name: string;
    buffs: Buff[];
    buffsPerRow: number;
    enabled: boolean;
    hideOutsideCombat: boolean;
    explicitInactive: boolean;
    overlayPosition: Coordinates;
    scale: number;
    children: Buff[];
}