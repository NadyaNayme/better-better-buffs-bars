import type { BuffsSlice } from '../store/buffsSlice';
import type { GroupsSlice } from '../store/groupsSlice';
import type { ProfilesSlice } from '../store/profilesSlice';
import type { SettingsSlice } from '../store/settingsSlice';
import type { UISlice } from '../store/uiSlice';
import type { DebugSlice } from '../store/debugSlice';

export type Store = BuffsSlice & GroupsSlice & ProfilesSlice & SettingsSlice & UISlice & DebugSlice;