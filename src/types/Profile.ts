import type { Group } from './Group';

export interface Profile {
  id: string;
  name: string;
  groups: Group[];
}