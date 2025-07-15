import { useState } from 'react';
import useStore from '../../store/index';

const ThresholdEditor = () => {
  const buffs = useStore(state => state.buffs);
  const customThresholds = useStore(state => state.customThresholds);
  const setCustomThreshold = useStore(state => state.setCustomThreshold);
  const removeCustomThreshold = useStore(state => state.removeCustomThreshold);

  const [selectedBuffId, setSelectedBuffId] = useState('');
  const [pass, setPass] = useState('');
  const [fail, setFail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passNum = parseInt(pass, 10);
    const failNum = parseInt(fail, 10);

    if (!selectedBuffId || isNaN(passNum) || isNaN(failNum)) return;

    setCustomThreshold(selectedBuffId, { pass: passNum, fail: failNum });

    setSelectedBuffId('');
    setPass('');
    setFail('');
  };

  const getBuffName = (id: string) => {
    const buff = buffs.find(b => b.id === id);
    return buff?.name || id;
  };

  return (
    <div className="p-4 border rounded bg-gray-100">
      <h3 className="text-lg font-semibold mb-2">Buff Threshold Overrides</h3>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <select
          value={selectedBuffId}
          onChange={(e) => setSelectedBuffId(e.target.value)}
          className="p-1 border"
        >
          <option value="">Select a buff</option>
          {buffs.map((buff) => (
            <option key={buff.id} value={buff.id}>
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
          <h4 className="font-semibold mb-1">Current Overrides</h4>
          <ul className="space-y-1">
            {Object.entries(customThresholds).map(([id, thresholds]) => (
              <li
                key={id}
                className="flex justify-between items-center bg-slate-700 border p-2 rounded"
              >
                <span className="text-sm">
                  <strong>{getBuffName(id)}</strong>: Pass {thresholds.pass}, Fail {thresholds.fail}
                </span>
                <button
                  onClick={() => removeCustomThreshold(id)}
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