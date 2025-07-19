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
import { DndContext, closestCenter, DragOverlay, type DragStartEvent, type DragOverEvent } from '@dnd-kit/core';
import { isRuntimeBuff } from './types/Buff';
import BuffComponent from './components/features/buffs/BuffComponent';

function App() {
  const [alt1Ready, setAlt1Ready] = useState(false);
  const [alt1Detected, setAlt1Detected] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<'group' | 'profile' | null>(null);
  const [activeBuff, setActiveBuff] = useState<any | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);

  const groups: Group[] = useStore((state: Store) => state.groups);
  const createGroup = useStore((state: Store) => state.createGroup);
  const createProfile = useStore((state: Store) => state.createProfile);
  const setBuffsFromJsonIfNewer = useStore((state: Store) => state.setBuffsFromJsonIfNewer);
  const rescaleAllGroups = useImageRescaler();
  const inCombat = useStore((state: Store) => state.inCombat);
  const combatCheck = useStore((state: Store) => state.combatCheck);
  const debugMode = useStore((state: Store) => state.debugMode);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const allGroups = useStore.getState().groups;
  
    for (const group of allGroups) {
      const match = group.buffs.find((buff) => isRuntimeBuff(buff) && buff.id === active.id);
      if (match && isRuntimeBuff(match)) {
        setActiveBuff(match);
        return;
      }
    }
  
    setActiveBuff(null); // fallback
  };

  const handleDragOver = (event: any) => {
    console.log('Dragging over:', event.over?.id);
    const { over } = event;
    if (!over) {
      setDragOverGroupId(null);
      return;
    }
    
    // Extract group id from over.id, which can be either a buff id or a drop placeholder id
    if (over.id.startsWith("drop-placeholder-")) {
      setDragOverGroupId(over.id.replace("drop-placeholder-", ""));
    } else {
      // Find which group the buff being dragged over belongs to
      const allGroups = useStore.getState().groups;
      const group = allGroups.find(g => g.buffs.some(b => b.id === over.id));
      setDragOverGroupId(group ? group.id : null);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over, pointerCoordinates } = event;
    if (!over || active.id === over.id) return;
  
    const allGroups = useStore.getState().groups;
  
    const fromGroup = allGroups.find(group =>
      group.buffs.some(buff => isRuntimeBuff(buff) && buff.id === active.id)
    );
  
    let toGroup: Group | undefined;
    let toIndex = 0;
  
    if (over.id.startsWith("drop-placeholder-")) {
      const targetGroupId = over.id.replace("drop-placeholder-", "");
      toGroup = allGroups.find(g => g.id === targetGroupId);
      if (!fromGroup || !toGroup) return;
  
      toIndex = toGroup.buffs.length;
    } else {
      toGroup = allGroups.find(group =>
        group.buffs.some(buff => isRuntimeBuff(buff) && buff.id === over.id)
      );
      if (!fromGroup || !toGroup) return;
  
      const overIndex = toGroup.buffs.findIndex(b => b.id === over.id);
      if (overIndex === -1) return;
  
      const overRect = over.rect;
      if (overRect && pointerCoordinates) {
        const midpoint = overRect.top + overRect.height / 2;
        toIndex = pointerCoordinates.y > midpoint ? overIndex + 1 : overIndex;
      } else {
        toIndex = overIndex;
      }
  
      toIndex = Math.min(toIndex, toGroup.buffs.length);
    }
  
    const fromIndex = fromGroup?.buffs.findIndex(
      b => isRuntimeBuff(b) && b.id === active.id
    );
  
    if (
      fromGroup &&
      toGroup &&
      typeof fromIndex === "number" &&
      fromIndex !== -1
    ) {
      if (fromGroup.id === toGroup.id) {
        useStore.getState().reorderBuffsInGroup(fromGroup.id, fromIndex, toIndex);
      } else {
        useStore.getState().moveBuffBetweenGroups(
          fromGroup.id,
          toGroup.id,
          active.id,
          toIndex
        );
      }
    }
  
    setActiveBuff(null);
  };


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
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragCancel={() => setActiveBuff(null)}
      >
      <div className="space-y-8 mb-8">
        {groups.map((group: any) => (
          <GroupComponent key={group.id} group={group} alt1Ready={alt1Ready} a1lib={a1lib} inCombat={inCombat} combatCheck={combatCheck} activeBuff={activeBuff} dragOverGroupId={dragOverGroupId} />
        ))}
      </div>
      <DragOverlay>
        {activeBuff ? (
          <BuffComponent
            buff={activeBuff}
            onRemove={() => {}} // no-op during drag
          />
        ) : null}
      </DragOverlay>
      </DndContext>

      <div className="mb-8">
        <button onClick={openModalForGroup} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
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
          {/* <ThresholdEditor/> */}
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