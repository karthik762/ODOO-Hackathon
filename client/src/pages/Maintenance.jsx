import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MaintenanceTimeline from '../components/MaintenanceTimeline';

/**
 * Maintenance Directory Page
 * Coordinates issue reporting forms, expense cards, approval queues, and progress timelines.
 */
const Maintenance = () => {
  const { user } = useAuth();
  const isPrivileged = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab switch
  const [activeTab, setActiveTab] = useState('active'); 
  const [selectedTicketId, setSelectedTicketId] = useState(null); 

  // Form modalities
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    asset: '',
    title: '',
    description: '',
    priority: 'Medium'
  });

  // Resolve actions
  const [resolveTicketId, setResolveTicketId] = useState(null);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveData, setResolveData] = useState({
    cost: '',
    notes: ''
  });

  // Confirms
  const [rejectConfirmId, setRejectConfirmId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve maintenance tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets?limit=100');
      if (res.data.success) {
        setAssets(res.data.assets);
      }
    } catch (err) {
      console.error('Error loading assets list:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchAssets();
  }, []);

  const handleOpenForm = () => {
    setFormError(null);
    setFormData({ asset: '', title: '', description: '', priority: 'Medium' });
    setIsFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const res = await api.post('/maintenance', formData);
      if (res.data.success) {
        setIsFormOpen(false);
        fetchTickets();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit maintenance request');
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await api.patch(`/maintenance/${id}/approve`);
      if (res.data.success) {
        fetchTickets();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Approve operation failed');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await api.patch(`/maintenance/${id}/reject`);
      if (res.data.success) {
        setRejectConfirmId(null);
        fetchTickets();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Reject operation failed');
      setRejectConfirmId(null);
    }
  };

  const handleResolveOpen = (id) => {
    setResolveTicketId(id);
    setResolveData({ cost: '', notes: '' });
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setResolveLoading(true);
    try {
      const res = await api.patch(`/maintenance/${resolveTicketId}/resolve`, resolveData);
      if (res.data.success) {
        setResolveTicketId(null);
        fetchTickets();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Resolve operation failed');
      setResolveTicketId(null);
    } finally {
      setResolveLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/maintenance/${id}`);
      if (res.data.success) {
        setDeleteConfirmId(null);
        fetchTickets();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed');
      setDeleteConfirmId(null);
    }
  };

  // Filtration logic
  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'active') {
      return t.status === 'Pending' || t.status === 'Approved';
    }
    return t.status === 'Resolved' || t.status === 'Rejected';
  });

  // Calculate statistics
  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const approvedCount = tickets.filter((t) => t.status === 'Approved').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const totalCost = tickets.reduce((sum, t) => sum + (t.cost || 0), 0);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'High':
        return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)' };
      case 'Medium':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' };
      default: 
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' };
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'left' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-h)', fontWeight: '800' }}>Maintenance Center</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '14px' }}>
            Submit tickets, monitor hardware repairs, and audit maintenance history log files
          </p>
        </div>
        <button
          onClick={handleOpenForm}
          className="counter"
          style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '14px', border: 'none', borderRadius: '6px' }}
        >
          Raise Request
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 'bold' }}>Pending Requests</span>
          <h3 style={{ margin: '8px 0 0', color: '#f59e0b', fontSize: '28px', fontWeight: '800' }}>{pendingCount}</h3>
        </div>
        <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 'bold' }}>Under Repair</span>
          <h3 style={{ margin: '8px 0 0', color: 'var(--accent)', fontSize: '28px', fontWeight: '800' }}>{approvedCount}</h3>
        </div>
        <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 'bold' }}>Resolved Issues</span>
          <h3 style={{ margin: '8px 0 0', color: '#22c55e', fontSize: '28px', fontWeight: '800' }}>{resolvedCount}</h3>
        </div>
        <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Expenditure</span>
          <h3 style={{ margin: '8px 0 0', color: 'var(--text-h)', fontSize: '28px', fontWeight: '800' }}>${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Tab select switches */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => { setActiveTab('active'); setSelectedTicketId(null); }}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'active' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'active' ? 'var(--accent)' : 'var(--text)',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Active Queue (Pending / Repair)
        </button>
        <button
          onClick={() => { setActiveTab('history'); setSelectedTicketId(null); }}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'history' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'history' ? 'var(--accent)' : 'var(--text)',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          History Archive (Resolved / Rejected)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTicketId ? '1.5fr 1fr' : '1fr', gap: '24px', transition: 'all 0.3s' }}>
        {/* Table grids list */}
        <div style={{
          background: 'var(--code-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)'
        }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text)' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite', margin: '0 auto 12px' }}></div>
              Loading tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text)' }}>
              No tickets listed in this queue.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.05)' }}>
                    <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Asset details</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Issue / Title</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Priority</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Reported By</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => {
                    const pStyle = getPriorityStyle(t.priority);
                    const isSelected = selectedTicketId === t._id;
                    
                    return (
                      <tr
                        key={t._id}
                        onClick={() => setSelectedTicketId(isSelected ? null : t._id)}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(0,0,0,0.02)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                      >
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 'bold', color: 'var(--text-h)' }}>{t.asset?.name}</div>
                          <span style={{ fontSize: '11px', color: 'var(--text)', opacity: 0.8 }}>S/N: {t.asset?.serialNumber}</span>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-h)' }}>
                          <div style={{ fontWeight: '600' }}>{t.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', color: pStyle.color, background: pStyle.bg, border: pStyle.border }}>
                            {t.priority}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text)' }}>
                          <div>{t.reportedBy?.name}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: t.status === 'Resolved' ? 'rgba(34, 197, 94, 0.1)' : (t.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'),
                            color: t.status === 'Resolved' ? '#22c55e' : (t.status === 'Pending' ? '#f59e0b' : '#3b82f6'),
                            border: t.status === 'Resolved' ? '1px solid rgba(34, 197, 94, 0.3)' : (t.status === 'Pending' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)')
                          }}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {t.status === 'Pending' && isPrivileged && (
                              <>
                                <button
                                  onClick={() => handleApprove(t._id)}
                                  style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', color: '#22c55e', cursor: 'pointer', fontWeight: '600' }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRejectConfirmId(t._id)}
                                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {t.status === 'Approved' && isPrivileged && (
                              <button
                                onClick={() => handleResolveOpen(t._id)}
                                style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}
                              >
                                Resolve
                              </button>
                            )}

                            {isPrivileged && (
                              <button
                                onClick={() => setDeleteConfirmId(t._id)}
                                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', color: 'var(--text-h)', cursor: 'pointer' }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Details display info */}
        {selectedTicketId && (
          <div style={{
            background: 'var(--code-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {(() => {
              const ticket = tickets.find((t) => t._id === selectedTicketId);
              if (!ticket) return null;
              
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-h)', fontSize: '16px', fontWeight: '700' }}>Ticket Details</h3>
                    <button
                      onClick={() => setSelectedTicketId(null)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '20px', cursor: 'pointer' }}
                    >
                      &times;
                    </button>
                  </div>
                  
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                    <div><strong>Asset Resource:</strong> {ticket.asset?.name} ({ticket.asset?.serialNumber})</div>
                    <div><strong>Priority Level:</strong> {ticket.priority}</div>
                    <div><strong>Reported:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
                    {ticket.status === 'Resolved' && (
                      <>
                        <div><strong>Expenditure cost:</strong> ${ticket.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div><strong>Resolved:</strong> {new Date(ticket.resolvedAt).toLocaleString()}</div>
                      </>
                    )}
                  </div>

                  <MaintenanceTimeline status={ticket.status} />

                  {ticket.notes && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                      <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-h)', marginBottom: '4px' }}>Resolution Comments</strong>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)', lineHeight: '1.4' }}>{ticket.notes}</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* CREATE REQUEST MODAL */}
      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow)',
            animation: 'scaleUp 0.2s ease',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsFormOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-h)', fontSize: '20px', cursor: 'pointer' }}
            >
              &times;
            </button>
            <h3 style={{ margin: '0 0 20px', color: 'var(--text-h)', fontSize: '22px', fontWeight: '800' }}>
              Report Issue / Raise Request
            </h3>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '13px' }}>
                  {formError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Select Target Asset *</label>
                <select
                  name="asset"
                  value={formData.asset}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', cursor: 'pointer', outline: 'none' }}
                  required
                >
                  <option value="">Choose Asset Item</option>
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>{a.name} (S/N: {a.serialNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Issue Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Cracked screen, Broken battery..."
                  value={formData.title}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Description of Issue</label>
                <textarea
                  name="description"
                  placeholder="Explain issue details..."
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', resize: 'vertical', minHeight: '80px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Priority Level</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="counter"
                  style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {formLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {resolveTicketId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '450px',
            boxShadow: 'var(--shadow)',
            animation: 'scaleUp 0.2s ease',
            position: 'relative'
          }}>
            <button
              onClick={() => setResolveTicketId(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-h)', fontSize: '20px', cursor: 'pointer' }}
            >
              &times;
            </button>
            <h3 style={{ margin: '0 0 20px', color: 'var(--text-h)', fontSize: '22px', fontWeight: '800' }}>
              Resolve Maintenance Request
            </h3>
            
            <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Repair Cost ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 120.00"
                  value={resolveData.cost}
                  onChange={(e) => setResolveData({ ...resolveData, cost: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Resolution Notes</label>
                <textarea
                  placeholder="Notes about repair, replaced parts..."
                  value={resolveData.notes}
                  onChange={(e) => setResolveData({ ...resolveData, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', resize: 'vertical', minHeight: '80px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={resolveLoading}
                  className="counter"
                  style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {resolveLoading ? 'Resolving...' : 'Confirm Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT DIALOG */}
      {rejectConfirmId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 101
        }}>
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: 'var(--shadow)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--text-h)', fontSize: '20px', fontWeight: '800' }}>Confirm Rejection</h3>
            <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to reject this request? The status will update to Rejected and the asset remains Available.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setRejectConfirmId(null)}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-h)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectConfirmId)}
                style={{ padding: '8px 20px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      {deleteConfirmId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 101
        }}>
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: 'var(--shadow)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--text-h)', fontSize: '20px', fontWeight: '800' }}>Confirm Delete</h3>
            <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to delete this maintenance ticket from records? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-h)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                style={{ padding: '8px 20px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
