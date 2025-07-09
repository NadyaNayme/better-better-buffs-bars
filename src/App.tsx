import { useCallback, useEffect, useState } from 'react';
import useStore from './store';
import buffsData from './buffs.json';
import a1lib from 'alt1';
import { isAlt1Available } from "./lib/alt1Utils";
import { BuffReaderComponent } from './components/BuffReaderComponent';
import { CooldownTimer } from './components/CooldownTimer';
import PopupModal from './components/PopupModal';
import ProfileManager from './components/ProfileManager';
import ThresholdEditor from './components/ThresholdEditor';
import Debug from './components/Debug';
import { type Group } from './types/Group';
import GroupComponent from './components/GroupComponent';
import SettingsPanelComponent from './components/SettingsPanelComponent';
import { ActionBarReaderComponent } from './components/ActionBarReaderComponent';
import { toast, Toaster } from 'sonner';
import { TargetMobReaderComponent } from './components/TargetMobReaderComponent';

function App() {
  const [alt1Ready, setAlt1Ready] = useState(false);
  const [alt1Detected, setAlt1Detected] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<'group' | 'profile' | null>(null);

  const groups: Group[] = useStore((state: any) => state.groups);
  const createGroup = useStore((state: any) => state.createGroup);
  const createProfile = useStore((state: any) => state.createProfile);
  const syncGroupBuffs = useStore((state: any) => state.syncGroupBuffs);
  const setBuffsFromJsonIfNewer = useStore((state: any) => state.setBuffsFromJsonIfNewer);
  const syncIdentifiedBuffs = useStore((state: any) => state.syncIdentifiedBuffs);
  const rescaleAllGroupsOnLoad = useStore(state => state.rescaleAllGroupsOnLoad);
  const inCombat = useStore((state: any) => state.inCombat);
  const combatCheck = useStore((state: any) => state.combatCheck);
  const debugMode = useStore((state: any) => state.debugMode);

  const handleBuffsIdentified = useCallback((foundBuffsMap: Map<string, any>) => {
    syncIdentifiedBuffs(foundBuffsMap);
  }, [syncIdentifiedBuffs]);

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
    rescaleAllGroupsOnLoad();
  }, [rescaleAllGroupsOnLoad]);

  useEffect(() => {
    syncGroupBuffs(buffsData.buffs);
  }, []);

  useEffect(() => {
    if (isAlt1Available()) {
      console.log("✅ Alt1 detected and overlay permissions granted.");
      setAlt1Detected(true);
      window.alt1?.identifyAppUrl("./appconfig.json");
    } else {
      console.warn("⚠️ Alt1 not available or permissions missing.");
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

      <ProfileManager openModalForProfile={openModalForProfile} />
      <CooldownTimer/>
      <SettingsPanelComponent />
      <Toaster position="bottom-left" richColors />
      <PopupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        title={modalContext === 'group' ? 'Enter Group Name' : 'Enter Profile Name'}
        placeholder={modalContext === 'group' ? 'Group name...' : 'Profile name...'}
      />
      {(debugMode && 
        <>
          <Debug />
          <ThresholdEditor/>
        </>
      )}
      <ActionBarReaderComponent 
            debugMode={debugMode}
            a1lib={a1lib}
          />
      <TargetMobReaderComponent
          debugMode={debugMode}
          a1lib={a1lib}
      />
      <BuffReaderComponent 
            onBuffsIdentified={handleBuffsIdentified}
            debugMode={debugMode}
          />
      <BuffReaderComponent 
        isDebuff={true} 
        onBuffsIdentified={handleBuffsIdentified} 
        debugMode={debugMode}
      />
    </div>
  );
}

export default App;