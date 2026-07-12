import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Booking Form Component
 * Form to create reservations on shared meeting rooms, vehicles, or equipment.
 */
const BookingForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    asset: '',
    startDate: '',
    endDate: '',
    purpose: ''
  });

  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await api.get('/assets?limit=100');
        if (res.data.success) {
          // Filter to show only bookable categories: Meeting Rooms, Vehicles, Projectors, Conference Rooms
          const bookableCategories = ['meeting rooms', 'vehicles', 'projectors', 'conference rooms'];
          const filtered = res.data.assets.filter((asset) => {
            const catName = asset.category?.name?.toLowerCase() || '';
            return bookableCategories.some((bc) => catName.includes(bc));
          });
          setAssets(filtered);
        }
      } catch (err) {
        console.error('Error fetching assets for booking:', err);
      } finally {
        setLoadingAssets(false);
      }
    };
    fetchAssets();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          color: '#ef4444', 
          padding: '12px', 
          borderRadius: '8px', 
          fontSize: '13px' 
        }}>
          {error}
        </div>
      )}

      {/* Select Asset */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Select Resource *</label>
        <select
          name="asset"
          value={formData.asset}
          onChange={handleInputChange}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', cursor: 'pointer', outline: 'none' }}
          required
        >
          <option value="">{loadingAssets ? 'Loading resources...' : 'Select a Meeting Room, Vehicle, or Device'}</option>
          {assets.map((asset) => (
            <option key={asset._id} value={asset._id}>
              {asset.name} ({asset.category?.name} - S/N: {asset.serialNumber})
            </option>
          ))}
        </select>
      </div>

      {/* Start Date & Time */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Start Date & Time *</label>
        <input
          type="datetime-local"
          name="startDate"
          value={formData.startDate}
          onChange={handleInputChange}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
          required
        />
      </div>

      {/* End Date & Time */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>End Date & Time *</label>
        <input
          type="datetime-local"
          name="endDate"
          value={formData.endDate}
          onChange={handleInputChange}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
          required
        />
      </div>

      {/* Purpose */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Purpose of Reservation *</label>
        <textarea
          name="purpose"
          placeholder="e.g. Weekly Sync, Client Pitch meeting..."
          value={formData.purpose}
          onChange={handleInputChange}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', resize: 'vertical', minHeight: '80px', outline: 'none' }}
          required
        />
      </div>

      {/* Submit button */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          type="submit"
          disabled={loading}
          className="counter"
          style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
        >
          {loading ? 'Confirming...' : 'Book Resource'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
