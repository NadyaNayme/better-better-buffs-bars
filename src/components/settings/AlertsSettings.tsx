
import { alertsMap } from "../../data/alerts";
import useStore from "../../store";
import CheckboxSetting from "./CheckboxSetting";
import RangeSetting from "./RangeSetting";

interface AlertSettingsProps {
    onClose: () => void;
  }

const AlertsSettings: React.FC<AlertSettingsProps> = ({ onClose }) => {
  const alertEnabledMap = useStore((s) => s.alertEnabledMap);
  const toggleAlert = useStore((s) => s.toggleAlert);
  const voice = useStore((s) => s.voice);
  const setVoice = useStore((s) => s.setVoice);

  const enableAlerts = useStore(s => s.enableAlerts);
  const setEnableAlerts = useStore(s => s.setEnableAlerts);
  
  const alertVolume = useStore(s => s.alertVolume);
  const setAlertVolume = useStore(s => s.setAlertVolume);

  const playSample = (name: string) => {
    const path = `./assets/audio/${voice}/${alertsMap[name]}`;
    const audio = new Audio(path);
    audio.play();
  };

  return (
    <div className="fixed inset-0 z-1001 bg-black bg-opacity-70 flex justify-center items-start p-6 overflow-y-auto">
      <div className="bg-black dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-3xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close
        </button>

        <h2 className="text-2xl font-bold mb-4">Alert Settings</h2>
    <div className="space-y-4">
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
      <div className="flex gap-4 items-center">
        <label>Voice:</label>
        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value as any)}
          className="border px-2 py-1"
        >
          <option value="Callum">Male (Callum)</option>
          <option value="Lily">Female (Lily)</option>
        </select>
      </div>

      {Object.keys(alertsMap).sort().map((name) => (
        <div key={name} className="flex items-center gap-4">
          <span className="w-48">{name}</span>
          <button
            className={`px-3 py-1 rounded ${alertEnabledMap[name] ? 'bg-green-500' : 'bg-gray-300'}`}
            onClick={() => toggleAlert(name)}
          >
            {alertEnabledMap[name] ? 'Enabled' : 'Disabled'}
          </button>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => playSample(name)}
          >
            ▶️ Sample
          </button>
        </div>
      ))}
        <button
          onClick={onClose}
          className="text-sm px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close
        </button>
    </div>
      </div>
    </div>
  );
};

export default AlertsSettings;