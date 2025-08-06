import useStore from '../../store/index';

const Debug = () => {
    const { profiles, groups, activeProfile } = useStore();
    return (
      <>
        <h3>Debug Info</h3>
        <div style={{ padding: '5px', border: '1px solid #555', marginTop: '5px', marginBottom: '20px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Profile Information</p>
        {profiles.map(profile => (
          <div key={profile.id} style={{ opacity: activeProfile === profile.id ? 1 : 0.5 }}>
            <h4 style={{ fontWeight: 'bold' }}>{profile.name}</h4>
            {profile.id === activeProfile ? (
              <>
                <ul style={{paddingLeft: '10px'}}>
                  {groups.map(group => (
                    <li
                      key={group.id}
                      style={{ opacity: group.enabled ? 1 : 0.5 }}
                    >
                      {group.name} | Position: x: {group.overlayPosition?.x ?? 'N/A'}, y: {group.overlayPosition?.y ?? 'N/A'} {!group.enabled && ' (Inactive)'}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Not active profile</p>
            )}
          </div>
        ))}
        </div>
      </>
    );
  };

export default Debug;