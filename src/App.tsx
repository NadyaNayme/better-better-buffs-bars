import { useEffect, useState } from 'react';
import useStore from './store/index';
import a1lib from 'alt1';
import { isAlt1Available } from "./lib/alt1Utils";
import PopupModal from './components/common/modals/PopupModal';
import ThresholdEditor from './components/debug/ThresholdEditor';
import { type Group } from './types/Group';
import GroupComponent from './components/features/groups/GroupComponent';
import SettingsPanelComponent from './components/settings/SettingsPanelComponent';
import { toast, Toaster } from 'sonner';
import { useImageRescaler } from './hooks/useImageRescaler';
import { GlobalBuffProcessor } from './components/features/readers/GlobalBuffProcessor';
import { debugLog } from './lib/debugLog';
import type { Store } from './types/Store';
import ProfileManager from './components/features/profiles/ProfileManager';
import { CooldownTimer } from './components/features/buffs/CooldownTimer';
import { DebugOverlay } from './components/debug/DebugOverlay';
import Debug from './components/debug/Debug';
import { ActionBarReaderComponent } from './components/features/readers/ActionBarReaderComponent';
import { TargetMobReaderComponent } from './components/features/readers/TargetMobReaderComponent';

function App() {
  const [alt1Ready, setAlt1Ready] = useState(false);
  const [alt1Detected, setAlt1Detected] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<'group' | 'profile' | null>(null);

  const groups: Group[] = useStore((state: Store) => state.groups);
  const createGroup = useStore((state: Store) => state.createGroup);
  const createProfile = useStore((state: Store) => state.createProfile);
  const setBuffsFromJsonIfNewer = useStore((state: Store) => state.setBuffsFromJsonIfNewer);
  const rescaleAllGroups = useImageRescaler();
  const inCombat = useStore((state: Store) => state.inCombat);
  const combatCheck = useStore((state: Store) => state.combatCheck);
  const debugMode = useStore((state: Store) => state.debugMode);

  const openModalForGroup = () => {
    setModalContext('group');
    setModalOpen(true);
  };

  const openModalForProfile = () => {
    setModalContext('profile');
    setModalOpen(true);
  };

  const handleCreate = (name: string) => {
    if (modalContext === 'group') {
      createGroup(name);
      toast.success(`Group "${name}" Created`);
    } else if (modalContext === 'profile') {
      createProfile(name);
      toast.success(`Profile "${name}" Created`);
    }
  };

  useEffect(() => {
    rescaleAllGroups();
  }, [groups, rescaleAllGroups]);

  useEffect(() => {
    if (isAlt1Available()) {
      debugLog.success("Alt1 detected and overlay permissions granted.");
      setAlt1Detected(true);
      window.alt1?.identifyAppUrl("./appconfig.json");
    } else {
      debugLog.warning("Alt1 not available or permissions missing.");
    }
    setBuffsFromJsonIfNewer();    
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.alt1 && a1lib) {
        setAlt1Ready(true);
        clearInterval(interval);
      }
    }, 100);
  
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      {!alt1Detected && (
        <p className="text-red-500 text-center mt-8 mb-8 font-bold">Alt1 not detected. Please open this app inside Alt1.</p>
      )}
      {/* Groups */}
      <div className="space-y-8 mb-8">
        {groups.map((group: any) => (
          <GroupComponent key={group.id} group={group} alt1Ready={alt1Ready} a1lib={a1lib} inCombat={inCombat} combatCheck={combatCheck} />
        ))}
      </div>

      <div className="mb-8">
        <button onClick={openModalForGroup} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Create Group
        </button>
      </div>

      <div className="mb-8">
        <p>Sort buffs within a group by drag & dropping using <em>left click</em>.</p>
        <p>Delete buffs from a group using <em>right click</em>.</p>
      </div>

      {/* Profiles */}
      <ProfileManager openModalForProfile={openModalForProfile} />

      {/* Settings */}
      <SettingsPanelComponent />
      
      {/* Debugging */}
      {(debugMode && 
        <>
          <DebugOverlay />
          <Debug />
          <ThresholdEditor/>
        </>
      )}
      {/* Utility */}
      <CooldownTimer/>
      <Toaster position="bottom-left" richColors />
      <GlobalBuffProcessor/>
      <ActionBarReaderComponent 
            debugMode={debugMode}
            a1lib={a1lib}
          />
      <TargetMobReaderComponent
          readInterval={100}
          debugMode={debugMode}
          a1lib={a1lib}
      />
      <PopupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        title={modalContext === 'group' ? 'Enter Group Name' : 'Enter Profile Name'}
        placeholder={modalContext === 'group' ? 'Group name...' : 'Profile name...'}
      />
    </div>
  );
}

export default App;