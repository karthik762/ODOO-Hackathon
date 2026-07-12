import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Asset Details Page
 * Renders full metadata details of a selected inventory item.
 */
const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete Confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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
        setError(err.response?.data?.message || 'Failed to fetch asset details');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await api.delete(`/assets/${id}`);
      if (res.data.success) {
        setDeleteConfirmId(null);
        navigate('/assets');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed');
      setDeleteConfirmId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' };
      case 'Assigned':
        return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'Maintenance':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' };
      default: 
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text)' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite', margin: '0 auto 12px' }}></div>
        Loading asset details...
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div style={{
        background: 'var(--code-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text)'
      }}>
        <h3 style={{ color: '#ef4444', margin: '0 0 12px' }}>Error Loading Asset</h3>
        <p>{error || 'Asset not found.'}</p>
        <Link to="/assets" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600', marginTop: '16px', display: 'inline-block' }}>
          &larr; Back to Directory
        </Link>
      </div>
    );
  }

  const statStyle = getStatusColor(asset.status);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'left' }}>
      {/* Header buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/assets')}
          style={{ 
            background: 'transparent', 
            border: '1px solid var(--border)', 
            borderRadius: '6px', 
            color: 'var(--text-h)', 
            padding: '6px 12px', 
            fontSize: '13px', 
            cursor: 'pointer', 
            fontWeight: '600' 
          }}
        >
          &larr; Back to Directory
        </button>

        {canEdit && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => navigate(`/assets/${asset._id}/edit`)}
              style={{ 
                padding: '8px 16px', 
                cursor: 'pointer', 
                fontSize: '13px', 
                border: '1px solid var(--border)', 
                borderRadius: '6px', 
                background: 'transparent', 
                color: 'var(--text-h)', 
                fontWeight: '600' 
              }}
            >
              Edit Asset
            </button>
            <button
              onClick={() => setDeleteConfirmId(asset._id)}
              style={{ 
                padding: '8px 16px', 
                cursor: 'pointer', 
                fontSize: '13px', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                borderRadius: '6px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444', 
                fontWeight: '600' 
              }}
            >
              Delete Asset
            </button>
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Card Image */}
        <div style={{
          background: 'var(--code-bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {asset.image ? (
            <img src={`http://localhost:5000${asset.image}`} alt={asset.name} style={{ width: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '12px' }} />
          ) : (
            <div style={{ 
              height: '300px', 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: '#1a1d24', 
              color: 'var(--text)', 
              gap: '12px', 
              borderRadius: '12px' 
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="8" rx="2"/>
                <rect x="2" y="14" width="20" height="8" rx="2"/>
                <line x1="6" y1="6" x2="6.01" y2="6"/>
                <line x1="6" y1="18" x2="6.01" y2="18"/>
              </svg>
              No Image Attachment
            </div>
          )}
        </div>

        {/* Specifications panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'var(--code-bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 'bold' }}>
                {asset.category?.name || 'Unassigned Category'}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '3px 10px',
                borderRadius: '12px',
                color: statStyle.color,
                background: statStyle.bg,
                border: statStyle.border
              }}>
                {asset.status}
              </span>
            </div>

            <h1 style={{ margin: '0 0 8px', color: 'var(--text-h)', fontSize: '28px', fontWeight: '800' }}>
              {asset.name}
            </h1>
            <p style={{ margin: '0 0 24px', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--mono)', opacity: 0.8 }}>
              Serial Number: {asset.serialNumber}
            </p>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px 32px', 
              borderTop: '1px solid var(--border)', 
              paddingTop: '24px', 
              fontSize: '14px' 
            }}>
              <div>
                <strong style={{ color: 'var(--text-h)', display: 'block', marginBottom: '4px' }}>Model Number</strong>
                <span style={{ color: 'var(--text)' }}>{asset.model || '—'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-h)', display: 'block', marginBottom: '4px' }}>Corporate Department</strong>
                <span style={{ color: 'var(--text)' }}>{asset.department?.name} ({asset.department?.code})</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-h)', display: 'block', marginBottom: '4px' }}>Purchase Cost</strong>
                <span style={{ color: 'var(--text)', fontWeight: '600' }}>{asset.cost ? `$${asset.cost.toLocaleString()}` : '$0'}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-h)', display: 'block', marginBottom: '4px' }}>Purchase Date</strong>
                <span style={{ color: 'var(--text)' }}>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '—'}</span>
              </div>
            </div>

            {asset.description && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '24px' }}>
                <strong style={{ color: 'var(--text-h)', display: 'block', marginBottom: '6px', fontSize: '14px' }}>Asset Description</strong>
                <p style={{ margin: 0, color: 'var(--text)', fontSize: '14px', lineHeight: '1.6' }}>{asset.description}</p>
              </div>
            )}
          </div>

          {/* Allocation Details */}
          {asset.status === 'Assigned' && asset.assignedTo && (
            <div style={{
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px 32px',
              boxShadow: 'var(--shadow)'
            }}>
              <h3 style={{ 
                margin: '0 0 16px', 
                color: 'var(--text-h)', 
                fontSize: '16px', 
                fontWeight: '700', 
                borderBottom: '1px solid var(--border)', 
                paddingBottom: '8px' 
              }}>
                Current Allocation Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                <div><strong style={{ color: 'var(--text-h)' }}>Employee Name:</strong> <span style={{ color: 'var(--text)' }}>{asset.assignedTo.name}</span></div>
                <div><strong style={{ color: 'var(--text-h)' }}>Email:</strong> <span style={{ color: 'var(--text)' }}>{asset.assignedTo.email}</span></div>
                <div><strong style={{ color: 'var(--text-h)' }}>Role:</strong> <span style={{ color: 'var(--text)' }}>{asset.assignedTo.role}</span></div>
                <div><strong style={{ color: 'var(--text-h)' }}>Department:</strong> <span style={{ color: 'var(--text)' }}>{asset.assignedTo.department || '—'}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
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
              Are you sure you want to delete this asset? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-h)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default AssetDetails;
