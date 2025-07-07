import useStore from '../store';

const Debug = () => {
    const { profiles, groups, activeProfile } = useStore();
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
      </div>
    );
  };

export default Debug;