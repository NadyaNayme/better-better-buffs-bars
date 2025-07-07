import React, { useState } from 'react';
import useStore from '../store';

const ThresholdEditor = () => {
  const buffs = useStore(state => state.buffs);
  const customThresholds = useStore(state => state.customThresholds);
  const setCustomThreshold = useStore(state => state.setCustomThreshold);
  const removeCustomThreshold = useStore(state => state.removeCustomThreshold);

  const [selectedBuff, setSelectedBuff] = useState('');
  const [pass, setPass] = useState('');
  const [fail, setFail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBuff || isNaN(+pass) || isNaN(+fail)) return;

    setCustomThreshold(selectedBuff, {
      passThreshold: parseInt(pass, 10),
      failThreshold: parseInt(fail, 10),
    });

    setSelectedBuff('');
    setPass('');
    setFail('');
  };

  return (
    <div className="p-4 border rounded bg-gray-100">
      <h2 className="text-lg font-semibold mb-2">Buff Threshold Overrides</h2>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <select
          value={selectedBuff}
          onChange={(e) => setSelectedBuff(e.target.value)}
          className="p-1 border"
        >
          <option value="">Select a buff</option>
          {buffs.map((buff) => (
            <option key={buff.name} value={buff.name}>
              {buff.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Pass Threshold"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="p-1 border w-1/2"
          />
          <input
            type="number"
            placeholder="Fail Threshold"
            value={fail}
            onChange={(e) => setFail(e.target.value)}
            className="p-1 border w-1/2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
        >
          Save Override
        </button>
      </form>

      {Object.keys(customThresholds).length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-1">Current Overrides</h3>
          <ul className="space-y-1">
            {Object.entries(customThresholds).map(([name, thresholds]) => (
              <li
                key={name}
                className="flex justify-between items-center bg-white border p-2 rounded"
              >
                <span className="text-sm">
                  <strong>{name}</strong>: Pass {thresholds.passThreshold}, Fail {thresholds.failThreshold}
                </span>
                <button
                  onClick={() => removeCustomThreshold(name)}
                  className="text-red-600 hover:text-red-800 font-bold text-lg"
                  title="Remove override"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThresholdEditor;