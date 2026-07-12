import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AssetForm from '../components/AssetForm';

/**
 * Edit Asset Page
 * Fetches current asset info and renders the reusable form to submit changes.
 */
const EditAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/assets/${id}`);
        if (res.data.success) {
          setAsset(res.data.asset);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve asset details');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSubmitLoading(true);
    setError(null);
    try {
      // Must post as multipart form-data to support file uploads
      const res = await api.put(`/assets/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        navigate(`/assets/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update asset');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text)' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite', margin: '0 auto 12px' }}></div>
        Loading asset records...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', textAlign: 'left' }}>
        <button
          onClick={() => navigate(`/assets/${id}`)}
          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-h)', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
        >
          &larr; Back
        </button>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-h)', fontWeight: '800' }}>Edit Asset</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '14px' }}>Modify serial numbers, assignments, or update asset photos</p>
        </div>
      </div>

      <div style={{
        background: 'var(--code-bg)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: 'var(--shadow)'
      }}>
        <AssetForm initialData={asset} onSubmit={handleSubmit} loading={submitLoading} error={error} />
      </div>
    </div>
  );
};

export default EditAsset;
