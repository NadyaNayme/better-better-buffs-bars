import React, { useState } from 'react';
import useStore from '../store'; // adjust path as needed

const ThresholdEditor: React.FC = () => {
  const buffs = useStore((s) => s.buffs);
  const setCustomThreshold = useStore((s) => s.setCustomThreshold);
  const customThresholds = useStore((s) => s.customThresholds);

  const [selectedBuff, setSelectedBuff] = useState('');
  const [pass, setPass] = useState('');
  const [fail, setFail] = useState('');

  const handleSelectBuff = (buffName: string) => {
    setSelectedBuff(buffName);
    const custom = customThresholds?.[buffName];
    setPass(custom?.passThreshold?.toString() ?? '');
    setFail(custom?.failThreshold?.toString() ?? '');
  };

  const handleSave = () => {
    const passVal = parseInt(pass, 10);
    const failVal = parseInt(fail, 10);
    if (!selectedBuff || isNaN(passVal) || isNaN(failVal)) return;

    setCustomThreshold(selectedBuff, passVal, failVal);
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #888', borderRadius: 8, maxWidth: 400 }}>
      <h3>Buff Threshold Editor</h3>

      <label>
        <span>Buff:</span><br />
        <select
          value={selectedBuff}
          onChange={(e) => handleSelectBuff(e.target.value)}
          style={{ width: '100%', padding: '6px', marginBottom: '0.5rem' }}
        >
          <option value="">Select Buff</option>
          {buffs.map((buff) => (
            <option key={buff.name} value={buff.name}>
              {buff.name}
            </option>
          ))}
        </select>
      </label>

      {selectedBuff && (
        <>
          <label>
            <span>Pass Threshold:</span><br />
            <input
              type="number"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem', padding: '6px' }}
            />
          </label>

          <label>
            <span>Fail Threshold:</span><br />
            <input
              type="number"
              value={fail}
              onChange={(e) => setFail(e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem', padding: '6px' }}
            />
          </label>

          <button
            onClick={handleSave}
            style={{
              padding: '8px 12px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Save Thresholds
          </button>
        </>
      )}
    </div>
  );
};

export default ThresholdEditor;