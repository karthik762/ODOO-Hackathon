import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import BookingCalendar from '../components/BookingCalendar';

/**
 * Bookings Directory Page
 * Coordinates calendar schedulers, historical booking tables, and conflict checks.
 */
const Bookings = () => {
  const { user } = useAuth();
  const isPrivileged = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab switch
  const [activeTab, setActiveTab] = useState('schedule');

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Cancel and Delete confirms
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenBooking = () => {
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateBooking = async (formData) => {
    setFormLoading(true);
    setFormError(null);
    try {
      const res = await api.post('/bookings', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Booking conflict or server error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      const res = await api.patch(`/bookings/${id}/cancel`);
      if (res.data.success) {
        setCancelConfirmId(null);
        fetchBookings();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Cancel operation failed');
      setCancelConfirmId(null);
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      const res = await api.delete(`/bookings/${id}`);
      if (res.data.success) {
        setDeleteConfirmId(null);
        fetchBookings();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed');
      setDeleteConfirmId(null);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ margin: 0, color: 'var(--text-h)', fontWeight: '800' }}>Resource Reservations</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '14px' }}>
            Reserve Meeting Rooms, Vehicles, and Projector devices without booking conflicts
          </p>
        </div>
        <button
          onClick={handleOpenBooking}
          className="counter"
          style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '14px', border: 'none', borderRadius: '6px' }}
        >
          Book Resource
        </button>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          color: '#ef4444', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px', 
          fontSize: '13px' 
        }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('schedule')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'schedule' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'schedule' ? 'var(--accent)' : 'var(--text)',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Resource Schedule
        </button>
        <button
          onClick={() => setActiveTab('history')}
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
          Booking History List
        </button>
      </div>

      {/* Main timeline listing */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text)' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite', margin: '0 auto 12px' }}></div>
          Loading reservations...
        </div>
      ) : activeTab === 'schedule' ? (
        <BookingCalendar bookings={bookings} />
      ) : bookings.length === 0 ? (
        <div style={{ padding: '40px', color: 'var(--text)', background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          No reservations found.
        </div>
      ) : (
        <div style={{
          background: 'var(--code-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.05)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Resource / Asset</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Duration</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Booked By</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Purpose</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const isOwner = b.bookedBy?._id === user?._id;
                  const canCancel = b.status === 'Approved' && (isOwner || isPrivileged);
                  const canDelete = isPrivileged;

                  return (
                    <tr key={b._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-h)' }}>{b.asset?.name}</div>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 'bold' }}>
                          {b.asset?.category?.name || 'Asset'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text)' }}>
                        <div><strong>Start:</strong> {new Date(b.startDate).toLocaleString()}</div>
                        <div><strong>End:</strong> {new Date(b.endDate).toLocaleString()}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text)' }}>
                        <div>{b.bookedBy?.name}</div>
                        <div style={{ fontSize: '11px', opacity: 0.8 }}>{b.bookedBy?.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text)', maxWidth: '200px' }}>{b.purpose}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: b.status === 'Approved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: b.status === 'Approved' ? '#22c55e' : '#ef4444',
                          border: b.status === 'Approved' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {canCancel && (
                            <button
                              onClick={() => setCancelConfirmId(b._id)}
                              style={{ 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                border: '1px solid rgba(239, 68, 68, 0.3)', 
                                borderRadius: '4px', 
                                padding: '4px 10px', 
                                fontSize: '12px', 
                                color: '#ef4444', 
                                cursor: 'pointer', 
                                fontWeight: '600' 
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteConfirmId(b._id)}
                              style={{ 
                                background: 'transparent', 
                                border: '1px solid var(--border)', 
                                borderRadius: '4px', 
                                padding: '4px 10px', 
                                fontSize: '12px', 
                                color: 'var(--text-h)', 
                                cursor: 'pointer', 
                                fontWeight: '600' 
                              }}
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
        </div>
      )}

      {/* CREATE BOOKING MODAL */}
      {isModalOpen && (
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
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-h)',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
            <h3 style={{ margin: '0 0 20px', color: 'var(--text-h)', fontSize: '22px', fontWeight: '800', textAlign: 'left' }}>
              Book Asset Resource
            </h3>
            
            <BookingForm onSubmit={handleCreateBooking} loading={formLoading} error={formError} />
          </div>
        </div>
      )}

      {/* CANCEL CONFIRM DIALOG */}
      {cancelConfirmId && (
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
            <h3 style={{ margin: '0 0 12px', color: 'var(--text-h)', fontSize: '20px', fontWeight: '800' }}>Confirm Cancellation</h3>
            <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to cancel this resource booking? The time slot will be made immediately available.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setCancelConfirmId(null)}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-h)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Go Back
              </button>
              <button
                onClick={() => handleCancelBooking(cancelConfirmId)}
                style={{ padding: '8px 20px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
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
              Are you sure you want to delete this booking log from records? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-h)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBooking(deleteConfirmId)}
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

export default Bookings;
