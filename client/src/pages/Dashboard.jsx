import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Enterprise Dashboard Component
 * Renders role-based metrics, custom SVG data charts, timeline logs, and CSV export triggers.
 */
const Dashboard = () => {
  const { user } = useAuth();
  const isPrivileged = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportCSV = async (type) => {
    try {
      const response = await api.get(`/reports/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export CSV Error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text)' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite', margin: '0 auto 12px' }}></div>
        Loading dashboard metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '16px', borderRadius: '8px', textAlign: 'left' }}>
        {error}
      </div>
    );
  }

  // --- PRIVILEGED VIEWS (ADMIN & ASSET MANAGER) ---
  if (isPrivileged) {
    const { assets, bookings, maintenance, activityFeed } = stats;
    const assetStatus = assets.statusBreakdown || {};

    return (
      <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'left' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-h)', fontWeight: '800' }}>Control Center</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '14px' }}>
              Real-time enterprise statistics, department asset allocation, and audit reports exporter
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleExportCSV('assets')}
              style={{
                background: 'var(--code-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-h)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              Export Assets CSV
            </button>
            <button
              onClick={() => handleExportCSV('bookings')}
              style={{
                background: 'var(--code-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-h)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              Export Bookings CSV
            </button>
          </div>
        </div>

        {/* STATS TILES GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Capital Assets</span>
            <h3 style={{ margin: '8px 0 0', color: 'var(--text-h)', fontSize: '28px', fontWeight: '800' }}>{assets.total}</h3>
          </div>
          <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 'bold' }}>Capital Value ($)</span>
            <h3 style={{ margin: '8px 0 0', color: 'var(--accent)', fontSize: '28px', fontWeight: '800' }}>${assets.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>
          <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Reservations</span>
            <h3 style={{ margin: '8px 0 0', color: '#22c55e', fontSize: '28px', fontWeight: '800' }}>{bookings.total}</h3>
          </div>
          <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 'bold' }}>Maintenance Cost ($)</span>
            <h3 style={{ margin: '8px 0 0', color: '#ef4444', fontSize: '28px', fontWeight: '800' }}>${maintenance.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        {/* CHARTS SECTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Asset Status distribution - Custom SVG Donut or Progress tracking lists */}
          <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow)' }}>
            <h4 style={{ margin: '0 0 16px', color: 'var(--text-h)', fontWeight: '700', fontSize: '15px' }}>Asset Status Distribution</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {/* Custom SVG Ring chart */}
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="12" />
                  {assets.total > 0 && (() => {
                    const avPct = (assetStatus.Available || 0) / assets.total;
                    const asPct = (assetStatus.Assigned || 0) / assets.total;
                    const mtPct = (assetStatus.Maintenance || 0) / assets.total;
                    
                    const avLen = 2 * Math.PI * 50 * avPct;
                    const asLen = 2 * Math.PI * 50 * asPct;
                    const mtLen = 2 * Math.PI * 50 * mtPct;

                    let offset = 0;
                    return (
                      <>
                        {/* Available (Green) */}
                        {avLen > 0 && (
                          <circle cx="60" cy="60" r="50" fill="none" stroke="#22c55e" strokeWidth="12"
                            strokeDasharray={`${avLen} 314`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />
                        )}
                        {/* Assigned (Accent Blue) */}
                        {(() => { offset += avLen; })()}
                        {asLen > 0 && (
                          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent)" strokeWidth="12"
                            strokeDasharray={`${asLen} 314`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />
                        )}
                        {/* Maintenance (Orange/Red) */}
                        {(() => { offset += asLen; })()}
                        {mtLen > 0 && (
                          <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="12"
                            strokeDasharray={`${mtLen} 314`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />
                        )}
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Legend with progress indicators */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></span> Available
                  </span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-h)' }}>{assetStatus.Available || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }}></span> Assigned
                  </span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-h)' }}>{assetStatus.Assigned || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span> Maintenance
                  </span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-h)' }}>{assetStatus.Maintenance || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> Retired
                  </span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-h)' }}>{assetStatus.Retired || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Department asset counts chart */}
          <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow)' }}>
            <h4 style={{ margin: '0 0 16px', color: 'var(--text-h)', fontWeight: '700', fontSize: '15px' }}>Asset Allocation by Department</h4>
            {assets.departmentBreakdown.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text)', fontSize: '13px' }}>
                No assets assigned to departments.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {assets.departmentBreakdown.map((d, index) => {
                  const maxCount = Math.max(...assets.departmentBreakdown.map((x) => x.count));
                  const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                  return (
                    <div key={index} style={{ fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-h)', fontWeight: '600' }}>{d.department}</span>
                        <span style={{ fontWeight: 'bold' }}>{d.count} items</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY TIMELINE */}
        <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow)' }}>
          <h4 style={{ margin: '0 0 20px', color: 'var(--text-h)', fontWeight: '700', fontSize: '16px' }}>Enterprise Activity Log Feed</h4>
          
          {activityFeed.length === 0 ? (
            <p style={{ color: 'var(--text)', fontSize: '13px' }}>No recent activity records.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              {/* Timeline center line */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '16px', width: '2px', background: 'var(--border)' }}></div>

              {activityFeed.map((a, i) => {
                const isBooking = a.type === 'booking';
                return (
                  <div key={i} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isBooking ? 'var(--accent-bg)' : 'rgba(245, 158, 11, 0.1)',
                      border: isBooking ? '1px solid var(--accent-border)' : '1px solid rgba(245, 158, 11, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: isBooking ? 'var(--accent)' : '#f59e0b'
                    }}>
                      {isBooking ? '📅' : '🔧'}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left', background: 'var(--bg)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text)', float: 'right' }}>
                        {new Date(a.date).toLocaleDateString()}
                      </span>
                      <h5 style={{ margin: '0 0 4px', color: 'var(--text-h)', fontSize: '14px', fontWeight: '700' }}>{a.title}</h5>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)', opacity: 0.9 }}>{a.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STANDARD STAFF VIEWS (EMPLOYEE / DEPARTMENT HEAD) ---
  const { assets, bookings, maintenance, activityFeed, notifications } = stats;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'left' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-h)', fontWeight: '800' }}>Welcome Back, {user?.name}</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '14px' }}>
          Overview of your assigned hardware workspace, reservation schedules, and reported tickets
        </p>
      </div>

      {/* NOTIFICATION BULLETINS */}
      {notifications && notifications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {notifications.map((n, i) => (
            <div
              key={i}
              style={{
                background: n.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                border: n.type === 'success' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border)',
                color: n.type === 'success' ? '#22c55e' : 'var(--text-h)',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>{n.type === 'success' ? '🎉' : '🔔'}</span>
              <span style={{ flex: 1 }}>{n.message}</span>
              <span style={{ fontSize: '11px', color: 'var(--text)', opacity: 0.8 }}>{new Date(n.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary Tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 'bold' }}>My Assigned Hardware</span>
          <h3 style={{ margin: '8px 0 0', color: 'var(--text-h)', fontSize: '28px', fontWeight: '800' }}>{assets.total}</h3>
        </div>
        <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 'bold' }}>My Booking Schedules</span>
          <h3 style={{ margin: '8px 0 0', color: 'var(--accent)', fontSize: '28px', fontWeight: '800' }}>{bookings.total}</h3>
        </div>
        <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 'bold' }}>My Reported Issues</span>
          <h3 style={{ margin: '8px 0 0', color: '#f59e0b', fontSize: '28px', fontWeight: '800' }}>{maintenance.total}</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Hardware details inventory */}
        <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow)' }}>
          <h4 style={{ margin: '0 0 16px', color: 'var(--text-h)', fontWeight: '700', fontSize: '15px' }}>My Workspaces & Devices</h4>
          {assets.list.length === 0 ? (
            <p style={{ color: 'var(--text)', fontSize: '13px', margin: 0 }}>No assets assigned to your workspace.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assets.list.map((a) => (
                <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div>
                    <h5 style={{ margin: '0 0 4px', color: 'var(--text-h)', fontSize: '14px', fontWeight: '700' }}>{a.name}</h5>
                    <span style={{ fontSize: '11px', color: 'var(--text)' }}>S/N: {a.serialNumber}</span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: a.status === 'Available' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: a.status === 'Available' ? '#22c55e' : 'var(--accent)'
                  }}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed logs */}
        <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow)' }}>
          <h4 style={{ margin: '0 0 16px', color: 'var(--text-h)', fontWeight: '700', fontSize: '15px' }}>My Timeline Feed</h4>
          {activityFeed.length === 0 ? (
            <p style={{ color: 'var(--text)', fontSize: '13px', margin: 0 }}>No recent schedules or tickets logs.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activityFeed.map((a, i) => (
                <div key={i} style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px', textAlign: 'left' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text)', opacity: 0.8 }}>
                    {new Date(a.date).toLocaleDateString()}
                  </span>
                  <h5 style={{ margin: '2px 0 4px', color: 'var(--text-h)', fontSize: '13px', fontWeight: '700' }}>{a.title}</h5>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text)' }}>{a.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
