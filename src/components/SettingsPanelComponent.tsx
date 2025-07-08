import React, { useState } from 'react';
import useStore from '../store';
import CheckboxSetting from './CheckboxSetting';
import RangeSetting from './RangeSetting';
import ColorSetting from './ColorSetting';
import SocialButtons from './SocialButtons';

const SettingsPanelComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    combatCheck,
    setEnableCombatCheck,
    enableAlerts,
    setEnableAlerts,
    alertVolume,
    setAlertVolume,
    debugMode,
    setDebugMode,
    cooldownColor,
    setCooldownColor,
    timeRemainingColor,
    setTimeRemainingColor,
  } = useStore(state => ({
    combatCheck: state.combatCheck,
    setEnableCombatCheck: state.setEnableCombatCheck,
    enableAlerts: state.enableAlerts,
    setEnableAlerts: state.setEnableAlerts,
    alertVolume: state.alertVolume,
    setAlertVolume: state.setAlertVolume,
    debugMode: state.debugMode,
    setDebugMode: state.setDebugMode,
    cooldownColor: state.cooldownColor,
    setCooldownColor: state.setCooldownColor,
    timeRemainingColor: state.timeRemainingColor,
    setTimeRemainingColor: state.setTimeRemainingColor,
  }));

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