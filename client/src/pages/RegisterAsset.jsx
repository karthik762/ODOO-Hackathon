import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AssetForm from '../components/AssetForm';

/**
 * Register Asset Page
 * Renders the reusable form to register a new corporate resource.
 */
const RegisterAsset = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Must post as multipart form-data to support file uploads
      const res = await api.post('/assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        navigate('/assets');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register new asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', textAlign: 'left' }}>
        <button
          onClick={() => navigate('/assets')}
          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-h)', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
        >
          &larr; Back
        </button>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-h)', fontWeight: '800' }}>Register Asset</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '14px' }}>Add a new physical asset or corporate resource to inventory tracking</p>
        </div>
      </div>

      <div style={{
        background: 'var(--code-bg)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: 'var(--shadow)'
      }}>
        <AssetForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default RegisterAsset;
