import React, { useEffect, useState } from 'react';
import useStore from '../../store/index';
import CheckboxSetting from './CheckboxSetting';
import ColorSetting from './ColorSetting';
import SocialButtons from '../common/SocialButtons';
import AlertsSettings from './AlertsSettings';
import { patchNotes } from "../../data/patchNotes";
import { PatchNotesComponent } from './PatchNotesComponent';

const SettingsPanelComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [showPatchNotes, setShowPatchNotes] = useState(false);

  const [showAlertSettings, setShowAlertSettings] = useState(false);

  const combatCheck = useStore(s => s.combatCheck);
  const setEnableCombatCheck = useStore(s => s.setEnableCombatCheck);
  
  const debugMode = useStore(s => s.debugMode);
  const setDebugMode = useStore(s => s.setDebugMode);
  
  const cooldownColor = useStore(s => s.cooldownColor);
  const setCooldownColor = useStore(s => s.setCooldownColor);
  
  const timeRemainingColor = useStore(s => s.timeRemainingColor);
  const setTimeRemainingColor = useStore(s => s.setTimeRemainingColor);

  const togglePanel = () => setIsOpen(!isOpen);

  useEffect(() => {
    const lastViewed = localStorage.getItem("lastViewedPatchNote");
    const latest = patchNotes[0].version;

    if (lastViewed !== latest) {
      setShowPatchNotes(true);
    }
  }, []);

  return (
    <>
      <button className="bg-slate-900 hover:bg-gray-700"
        onClick={togglePanel}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: showPatchNotes ? 3 : showAlertSettings ? 3 : isOpen ? 1000 : 3,
          backgroundColor: isOpen ? '#646cff' : '#1a1a1a'
        }}
      >
        {isOpen ? '⚙ Close Settings' : '⚙ Settings'}
      </button>

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-300px',
          height: '100%',
          width: '300px',
          backgroundColor: '#1a1a1a',
          color: 'white',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.4)',
          padding: '1rem',
          transition: 'right 0.3s ease',
          zIndex: 999,
          overflowY: 'auto',
        }}
      >
        <h2>Settings</h2>
        <button onClick={() => setShowPatchNotes(true)} className="w-[154px] text-size-md px-4 py-2 mt-2 mb-4 rounded bg-blue-600 hover:bg-blue-700" style={{padding: '.25rem .5rem'}} title={"Read patch notes"}>
          {patchNotes[0].version}
        </button>
        {showPatchNotes && <PatchNotesComponent onClose={() => setShowPatchNotes(false)} />}

        <CheckboxSetting
          label="Hide overlays outside of combat"
          checked={combatCheck}
          onChange={setEnableCombatCheck}
        />

      <button
        onClick={() => setShowAlertSettings(!showAlertSettings)}
        className="px-4 py-2 mt-6 mb-6 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {!showAlertSettings ? 'Manage Alerts' : 'Close Alert Settings'}
      </button>

      {showAlertSettings && (
          <AlertsSettings onClose={() => setShowAlertSettings(false)} />
      )}

        <br /><hr /><br />

        <ColorSetting
          label="Time Remaining Color"
          value={timeRemainingColor}
          onChange={setTimeRemainingColor}
        />

        <ColorSetting
          label="Cooldown Color"
          value={cooldownColor}
          onChange={setCooldownColor}
        />

        <br /><hr /><br />

        <CheckboxSetting
          label="Enable Debug Mode"
          checked={debugMode}
          onChange={setDebugMode}
        />

        <br /><hr /><br />
        <div style={{ textAlign: 'center', width: '100%' }}>
          <SocialButtons />
        </div>
      </div>
    </>
  );
};

export default SettingsPanelComponent;