import { useMemo, useState, type JSX } from 'react';
import useStore from '../../store'; // <-- adjust this import to your app's store entry
import { alertsMap as ALERTS, type AlertEntry } from '../../data/alerts';
import { playPreview } from '../../lib/playPreview';
import './AlertsSettings.css';
import CheckboxSetting from './CheckboxSetting';
import RangeSetting from './RangeSetting';

export default function AlertsManager(): JSX.Element {
  const voice = useStore((s) => s.voice);
  const setVoice = useStore((s) => s.setVoice);

  const enableAlerts = useStore((s) => s.enableAlerts);
  const setEnableAlerts = useStore((s) => s.setEnableAlerts);

  const alertVolume = useStore((s) => s.alertVolume);
  const setAlertVolume = useStore((s) => s.setAlertVolume);

  const [search, setSearch] = useState('');
  const allCollections = useMemo(() => Array.from(new Set(ALERTS.map(a => a.collection).filter(Boolean) as string[])), []);

  const alertEnabledMap = useStore(state => state.alerts);
  const toggleAlert = useStore(state => state.toggleAlert);
  const toggleCollection = useStore(state => state.toggleCollection);
  const toggleAll = useStore(state => state.toggleAll);

  const [selectedCollections] = useState(() => new Set(allCollections));

  const groupByCollection = useMemo(() => {
    const map = new Map<string, AlertEntry[]>();
    ALERTS.forEach(a => {
      const col = a.collection ?? 'Misc';
      if (!map.has(col)) map.set(col, []);
      map.get(col)!.push(a);
    });
    return map;
  }, []);

  function itemVisible(item: AlertEntry, q: string) {
    if (item.collection && !selectedCollections.has(item.collection)) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return item.label.toLowerCase().includes(s) || item.key.toLowerCase().includes(s);
  }

function renderGroupCard(groupName: string, items: AlertEntry[]) {
  const anyVisible = items.some(i => itemVisible(i, search));
  const groupStyle = { display: anyVisible ? 'block' : 'none' };
  const allEnabled = items.filter(i => itemVisible(i, search)).every(i => alertEnabledMap[i.key]);

  return (
      <div className="card" key={groupName} style={groupStyle}>
        <div className="card-header">
          <div className="left">
            <div className="title">{groupName}</div>
          </div>

          <div className="group-toggle">
            <div
              role="button"
              tabIndex={0}
              className={`switch ${allEnabled ? 'on' : ''}`}
              onClick={() => {
                toggleCollection(groupName);
              }}
            >
              <div className="knob" />
            </div>
          </div>
        </div>

        <div className="alert-list">
          {items.map(a => {
          const isVisible = itemVisible(a, search);
            return (
              <div className="alert-row" key={a.key} data-key={a.key} style={{ display: isVisible ? 'flex' : 'none' }}>
                <div className="alert-left">
                  <div
                    className="alert-name"
                    title={a.label}
                    onClick={() => playPreview(a.filename, voice, alertVolume)}
                  >
                    {a.label}
                  </div>
                </div>

                <div className="alert-toggle">
                  {(a.category ?? []).length > 0 && <div className="pill">{(a.category ?? []).join(', ')}</div>}
                  <div
                    role="button"
                    tabIndex={0}
                    className={`switch ${alertEnabledMap[a.key] ? 'on' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAlert(a.key);
                    }}
                  >
                    <div className="knob" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-app -scale-x-100">
      <aside className="alerts-sidenav -scale-x-100" style={{position: 'relative'}}>

        <div className="space-y-4">
          <CheckboxSetting
            label="Enable Alert System"
            checked={enableAlerts}
            onChange={setEnableAlerts}
          />

          <RangeSetting
            label="Alert Volume"
            value={alertVolume}
            onChange={setAlertVolume}
          />

          <div className="flex gap-4 items-center mb-[16px]">
            <label>Voice Pack</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value as any)}
              className="border px-2 py-1"
            >
              <option value="Callum">Male (Callum)</option>
              <option value="Lily">Female (Lily)</option>
            </select>
          </div>
        </div>

        <div className="searchBox">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search alerts..." />
        </div>

        <div className="filter-group">
          <div className="muted">Collections (filter view)</div>
          <div>
            {allCollections.map(col => (
              <label key={col} style={{ display: 'block', marginBottom: 6 }}>
                <input type="checkbox" defaultChecked onChange={(e) => {
                  if (!e.target.checked) selectedCollections.delete(col); else selectedCollections.add(col);
                }} />
                {' '}{col}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 8 }} className="controls-row">
          <button className="btn" onClick={() => toggleAll(true)}>Enable All</button>
          <button className="btn ghost" onClick={() => toggleAll(false)}>Disable All</button>
        </div>
      </aside>

      <main className="cards-main -scale-x-100">
        <div className="topControls">
          <div className="muted">Header switch toggles entire collection. Click alert name to play an audio sample.</div>
        </div>

        <div className="cards-grid">
          {Array.from(groupByCollection.entries()).map(([k, v]) => renderGroupCard(k, v))}
        </div>
      </main>
    </div>
  );
}