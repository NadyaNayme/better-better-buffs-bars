import { useCallback, useEffect, useState } from 'react';
// @ts-ignore
import useStore from './store';
// @ts-ignore
import useHasHydrated from './store';
// @ts-ignore
import Group from './components/Group';
// @ts-ignore
import ProfileManager from './components/ProfileManager';
// @ts-ignore
import Debug from './components/Debug';
// @ts-ignore
import { isAlt1Available } from "./lib/alt1Utils";
import PopupModal from './components/PopupModal';
import a1lib from 'alt1';
import { BuffReaderComponent } from './components/BuffReaderComponent';

function App() {
  const [alt1Ready, setAlt1Ready] = useState(false);
  const [alt1Detected, setAlt1Detected] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<'group' | 'profile' | null>(null);

  const groups = useStore((state: any) => state.groups);
  const createGroup = useStore((state: any) => state.createGroup);
  const createProfile = useStore((state: any) => state.createProfile);
  const setAllBuffsInactive = useStore((state: any) => state.setAllBuffsInactive);
  const updateBuffByName = useStore((state: any) => state.updateBuffByName);
  const setBuffsFromJsonIfNewer = useStore((state: any) => state.setBuffsFromJsonIfNewer);

  const handleDataRead = useCallback((detectedBuffs: any[]) => {
    // setAllBuffsInactive();
    // for (const detectedBuff of detectedBuffs) {
    //   console.log(detectedBuff);
    //   updateBuffByName(detectedBuff.name, detectedBuff.time);
    // }
  }, [setAllBuffsInactive, updateBuffByName]);

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
    } else if (modalContext === 'profile') {
      createProfile(name);
    }
  };

  useEffect(() => {
    console.log('window.alt1 at mount:', window.alt1);
    console.log('a1lib at mount:', a1lib);
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
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">Better Buffs Bar</h1>
      </header>

      {!alt1Detected && (
        <p className="text-red-500 text-center mb-8 font-bold">Alt1 not detected. Please open this app inside Alt1.</p>
      )}

      <ProfileManager openModalForProfile={openModalForProfile} />

      <div className="mb-8">
        <button onClick={openModalForGroup} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Create New Group
        </button>
      </div>

      <div className="mb-8">
      <p>Sort buffs within a group by drag & dropping using <em>left click</em>.</p>
      <p>Delete buffs from a group using <em>right click</em>.</p>
      </div>

      <div className="space-y-8">
        {groups.map((group: any) => (
          <Group key={group.id} group={group} alt1Ready={alt1Ready} a1lib={a1lib} />
        ))}
      </div>
      <PopupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        title={modalContext === 'group' ? 'Enter Group Name' : 'Enter Profile Name'}
        placeholder={modalContext === 'group' ? 'Group name...' : 'Profile name...'}
      />
      <Debug />
        <BuffReaderComponent 
              onDataRead={handleDataRead} 
            />
        <BuffReaderComponent 
          isDebuff={true} 
          onDataRead={handleDataRead} 
        />
    </div>
  );
}

export default App;