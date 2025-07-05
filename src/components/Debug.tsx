import useStore from '../store';

const Debug = () => {
    const { profiles, groups, activeProfile } = useStore();
  
    const activeProfileData = profiles.find(p => p.id === activeProfile);
    const debugMatchData = useStore(state => state.getDebugMatchData());
  
    return (
      <div>
        <h2>Debug Info</h2>
  
        {profiles.map(profile => (
          <div key={profile.id}>
            <h3>{profile.name}</h3>
            {profile.id === activeProfile ? (
              <ul>
                {groups.map(group => (
                  <li
                    key={group.id}
                    style={{ opacity: group.enabled ? 1 : 0.5 }}
                  >
                    {group.name} (Position: x: {group.overlayPosition?.x ?? 'N/A'}, y: {group.overlayPosition?.y ?? 'N/A'})
                    {!group.enabled && ' (Inactive)'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Not active profile</p>
            )}
          </div>
        ))}
        <div className="mt-8">
        <button className="mb-8" onClick={() => useStore.getState().clearDebugMatchData()}>
            Clear Debug
          </button>
          {Array.from(debugMatchData.entries()).map(([buffName, { history }]) => {
            const byDetected = history.reduce(
              (acc, entry) => {
                const key = entry.detected ? 'detected' : 'notDetected';
                acc[key].fail.push(entry.fail);
                acc[key].pass.push(entry.pass);
                return acc;
              },
              { detected: { fail: [], pass: [] }, notDetected: { fail: [], pass: [] } }
            );

            const formatStats = (arr: number[]) => {
              if (arr.length === 0) return 'N/A';
              const min = Math.min(...arr);
              const max = Math.max(...arr);
              const avg = Math.round(arr.reduce((a, b) => a + b) / arr.length);
              return `${min},${max},${avg}`;
            };

            return (
              <div key={buffName}>
                <h3>{buffName}</h3>
                <div>Not Detected: {formatStats(byDetected.notDetected.fail)} Fail | {formatStats(byDetected.notDetected.pass)} Pass</div>
                <div>Detected: {formatStats(byDetected.detected.fail)} Fail | {formatStats(byDetected.detected.pass)} Pass</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

export default Debug;