import { useState } from 'react';

/**
 * Booking Calendar / Schedule Component
 * Lists bookings grouped by date ranges, filters by today or upcoming schedules.
 */
const BookingCalendar = ({ bookings }) => {
  const [filter, setFilter] = useState('upcoming'); 

  const getLocalDateString = (dateObj) => new Date(dateObj).toLocaleDateString();
  const getLocalTimeString = (dateObj) => new Date(dateObj).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const todayStr = new Date().toLocaleDateString();

  const filteredBookings = bookings.filter((b) => {
    const bStart = new Date(b.startDate);
    const bEnd = new Date(b.endDate);
    const now = new Date();

    if (filter === 'today') {
      return bStart.toLocaleDateString() === todayStr;
    } else if (filter === 'upcoming') {
      return bEnd >= now;
    }
    return true; 
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      {/* Toggles */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {['upcoming', 'today', 'all'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: filter === type ? '1px solid var(--accent-border)' : '1px solid var(--border)',
              background: filter === type ? 'var(--accent-bg)' : 'transparent',
              color: filter === type ? 'var(--accent)' : 'var(--text)',
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'capitalize',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Bookings timeline list */}
      {filteredBookings.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text)', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
          No reservations listed for this selection.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredBookings.map((b) => {
            const isCancelled = b.status === 'Cancelled';
            return (
              <div
                key={b._id}
                style={{
                  background: 'var(--code-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow)',
                  opacity: isCancelled ? 0.6 : 1
                }}
              >
                <div>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase', 
                    color: 'var(--accent)', 
                    background: 'var(--accent-bg)', 
                    border: '1px solid var(--accent-border)', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    marginRight: '8px' 
                  }}>
                    {b.asset?.category?.name || 'Asset'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '600' }}>
                    S/N: {b.asset?.serialNumber}
                  </span>
                  <h4 style={{ margin: '6px 0 4px', color: 'var(--text-h)', fontSize: '16px', fontWeight: '700' }}>
                    {b.asset?.name}
                  </h4>
                  <p style={{ margin: '0 0 8px', color: 'var(--text)', fontSize: '13px' }}>
                    <strong>Purpose:</strong> {b.purpose}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text)' }}>
                    <span>
                      <strong>Date:</strong> {getLocalDateString(b.startDate)}
                    </span>
                    <span>
                      <strong>Time:</strong> {getLocalTimeString(b.startDate)} - {getLocalTimeString(b.endDate)}
                    </span>
                    <span>
                      <strong>Reserved By:</strong> {b.bookedBy?.name}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
