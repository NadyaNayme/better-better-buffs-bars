import type { Buff, BuffInstance } from './Buff';
import type { Coordinates } from './Coordinates';

export interface Group {
    id: string;
    name: string;
    buffs: Buff[] | BuffInstance[] | undefined;
    buffsPerRow: number;
    enabled: boolean;
    explicitInactive: boolean;
    overlayPosition: Coordinates;
    scale: number;
    children: Buff[] | BuffInstance[] | undefined;
}