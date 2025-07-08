import React, { useState } from 'react';
import useStore from '../store';
import { rgbToHex } from '../lib/colorUtils';
import type { Color } from '../types/Color';

const SettingsPanelComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    enableAlerts,
    alertVolume,
    debugMode,
    cooldownColor,
    timeRemainingColor,
    setEnableAlerts,
    setAlertVolume,
    setDebugMode,
    setCooldownColor,
    setTimeRemainingColor,
  } = useStore();

  const togglePanel = () => setIsOpen(!isOpen);

  const handleColorChange = (setter: (color: Color) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    setter({ r, g, b });
  };

  return (
    <>
      <button
        onClick={togglePanel}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: 1000,
        }}
      >
        ⚙ Settings
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

        <label>
          <input
            type="checkbox"
            checked={enableAlerts}
            onChange={(e) => setEnableAlerts(e.target.checked)}
          />
          Enable Alerts
        </label>

        <br />

        <label>
          Alert Volume: {alertVolume}
          <input
            type="range"
            min="0"
            max="100"
            value={alertVolume}
            onChange={(e) => setAlertVolume(Number(e.target.value))}
          />
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
          />
          Enable Debug Mode
        </label>

        <hr />

        <label>
          Cooldown Color:
          <input
            type="color"
            value={rgbToHex(cooldownColor)}
            onChange={handleColorChange(setCooldownColor)}
          />
        </label>

        <br />

        <label>
          Time Remaining Color:
          <input
            type="color"
            value={rgbToHex(timeRemainingColor)}
            onChange={handleColorChange(setTimeRemainingColor)}
          />
        </label>
      </div>
    </>
  );
};

export default SettingsPanelComponent;