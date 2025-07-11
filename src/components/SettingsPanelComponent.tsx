import React, { useState } from 'react';
import useStore from '../store/index';
import CheckboxSetting from './CheckboxSetting';
import RangeSetting from './RangeSetting';
import ColorSetting from './ColorSetting';
import SocialButtons from './SocialButtons';
import { PatchNotesComponent } from './PatchNotesComponent';

const SettingsPanelComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [showPatchNotes, setShowPatchNotes] = useState(false);

  const combatCheck = useStore(s => s.combatCheck);
  const setEnableCombatCheck = useStore(s => s.setEnableCombatCheck);

  const enableAlerts = useStore(s => s.enableAlerts);
  const setEnableAlerts = useStore(s => s.setEnableAlerts);
  
  const alertVolume = useStore(s => s.alertVolume);
  const setAlertVolume = useStore(s => s.setAlertVolume);
  
  const debugMode = useStore(s => s.debugMode);
  const setDebugMode = useStore(s => s.setDebugMode);
  
  const cooldownColor = useStore(s => s.cooldownColor);
  const setCooldownColor = useStore(s => s.setCooldownColor);
  
  const timeRemainingColor = useStore(s => s.timeRemainingColor);
  const setTimeRemainingColor = useStore(s => s.setTimeRemainingColor);

  const togglePanel = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        onClick={togglePanel}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: 1000,
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
        <h3 className="text-zinc-400">
          <button onClick={() => setShowPatchNotes(true)} className="underline hover:text-white">
            Version 0.3.3
          </button>
        </h3>
        {showPatchNotes && <PatchNotesComponent onClose={() => setShowPatchNotes(false)} />}

        <CheckboxSetting
          label="Hide overlays outside of combat"
          checked={combatCheck}
          onChange={setEnableCombatCheck}
        />

        <CheckboxSetting
          label="Enable Alerts"
          checked={enableAlerts}
          onChange={setEnableAlerts}
        />

        <RangeSetting
          label="Alert Volume"
          value={alertVolume}
          onChange={setAlertVolume}
        />

        <br /><hr /><br />

        <ColorSetting
          label="Time Remaining Color:"
          value={timeRemainingColor}
          onChange={setTimeRemainingColor}
        />

        <ColorSetting
          label="Cooldown Color:"
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