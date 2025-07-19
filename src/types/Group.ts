import type { Buff, BuffInstance } from './Buff';
import type { Coordinates } from './Coordinates';

export interface Group {
    id: string;
    name: string;
    buffs: BuffInstance[];
    buffsPerRow: number;
    enabled: boolean;
    hideOutsideCombat: boolean;
    explicitInactive: boolean;
    overlayPosition: Coordinates;
    scale: number;
    children: Buff[];
}