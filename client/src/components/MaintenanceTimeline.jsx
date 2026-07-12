/**
 * Maintenance Timeline Component
 * Renders a visual progress bar indicating ticket resolution status (Reported, Approved, In Repair, Resolved/Rejected).
 */
const MaintenanceTimeline = ({ status }) => {
  const isRejected = status === 'Rejected';
  
  const getStepStatus = (step) => {
    if (isRejected) {
      if (step === 1) return 'completed';
      if (step === 2) return 'rejected';
      return 'upcoming';
    }
    
    // Normal flow progression
    if (status === 'Pending') {
      return step === 1 ? 'active' : 'upcoming';
    }
    if (status === 'Approved') {
      if (step === 1) return 'completed';
      if (step === 2) return 'completed';
      if (step === 3) return 'active';
      return 'upcoming';
    }
    if (status === 'Resolved') {
      return 'completed';
    }
    return 'upcoming';
  };

  const getDotStyle = (stepStatus) => {
    const base = {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: 'bold',
      zIndex: 2,
      transition: 'all 0.3s'
    };

    if (stepStatus === 'completed') {
      return { ...base, background: '#22c55e', color: '#fff', border: '2px solid #22c55e' };
    }
    if (stepStatus === 'active') {
      return { ...base, background: 'var(--accent)', color: '#fff', border: '2px solid var(--accent)', boxShadow: '0 0 10px var(--accent)' };
    }
    if (stepStatus === 'rejected') {
      return { ...base, background: '#ef4444', color: '#fff', border: '2px solid #ef4444' };
    }
    return { ...base, background: 'var(--bg)', color: 'var(--text)', border: '2px solid var(--border)' };
  };

  const steps = [
    { num: 1, label: 'Reported' },
    { num: 2, label: isRejected ? 'Rejected' : 'Approved' },
    { num: 3, label: 'In Repair' },
    { num: 4, label: 'Resolved' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text)', letterSpacing: '1px' }}>
        Workflow Progression Timeline
      </span>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        padding: '10px 20px',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        marginTop: '8px'
      }}>
        {/* Connection Line */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '40px',
          right: '40px',
          height: '2px',
          background: isRejected ? '#ef4444' : (status === 'Resolved' ? '#22c55e' : 'var(--border)'),
          transform: 'translateY(-50%)',
          zIndex: 1
        }}></div>

        {steps.map((s) => {
          const stepStatus = getStepStatus(s.num);
          return (
            <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
              <div style={getDotStyle(stepStatus)}>
                {stepStatus === 'completed' ? '✓' : (stepStatus === 'rejected' ? '✕' : s.num)}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                color: stepStatus === 'upcoming' ? 'var(--text)' : 'var(--text-h)'
              }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MaintenanceTimeline;
