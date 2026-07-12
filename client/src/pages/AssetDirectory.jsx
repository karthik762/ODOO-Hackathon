import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Asset Directory Component
 * Displays a search-and-filter grid of inventory items with image rendering.
 */
const AssetDirectory = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'AssetManager';
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // Delete Confirm Dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchDropdownData = async () => {
    try {
      const [catRes, deptRes] = await Promise.all([
        api.get('/categories'),
        api.get('/departments')
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (deptRes.data.success) setDepartments(deptRes.data.departments);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search,
        category: selectedCategory,
        department: selectedDepartment,
        status: selectedStatus,
        page: currentPage,
        limit: itemsPerPage
      };
      
      const res = await api.get('/assets', { params });
      if (res.data.success) {
        setAssets(res.data.assets);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [search, selectedCategory, selectedDepartment, selectedStatus, currentPage]);

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/assets/${id}`);
      if (res.data.success) {
        setDeleteConfirmId(null);
        fetchAssets();
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

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-h)', fontWeight: '800' }}>Assets Inventory</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '14px' }}>
            Browse corporate resource allocations, status, and department assignments
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => navigate('/assets/new')}
            className="counter"
            style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '14px', border: 'none', borderRadius: '6px' }}
          >
            + Register Asset
          </button>
        )}
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

      {/* Filter panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        {/* Search Input field */}
        <input
          type="text"
          placeholder="Search by serial number or name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--code-bg)',
            color: 'var(--text-h)',
            fontSize: '14px',
            outline: 'none'
          }}
        />

        {/* Categories selector */}
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--code-bg)',
            color: 'var(--text-h)',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Departments selector */}
        <select
          value={selectedDepartment}
          onChange={(e) => { setSelectedDepartment(e.target.value); setCurrentPage(1); }}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--code-bg)',
            color: 'var(--text-h)',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        {/* Statuses selector */}
        <select
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--code-bg)',
            color: 'var(--text-h)',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {/* Grid container */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text)' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite', margin: '0 auto 12px' }}></div>
          Loading asset records...
        </div>
      ) : assets.length === 0 ? (
        <div style={{
          background: 'var(--code-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '60px',
          textAlign: 'center',
          color: 'var(--text)'
        }}>
          No assets found.
        </div>
      ) : (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {assets.map((asset) => {
              const stat = getStatusColor(asset.status);
              return (
                <div
                  key={asset._id}
                  style={{
                    background: 'var(--code-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow)',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {/* Uploaded File Image block */}
                  <div style={{
                    height: '180px',
                    background: '#1a1d24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    {asset.image ? (
                      <img src={`http://localhost:5000${asset.image}`} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="8" rx="2"/>
                        <rect x="2" y="14" width="20" height="8" rx="2"/>
                        <line x1="6" y1="6" x2="6.01" y2="6"/>
                        <line x1="6" y1="18" x2="6.01" y2="18"/>
                      </svg>
                    )}
                  </div>

                  {/* Body elements details */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 'bold' }}>
                        {asset.category?.name || 'Unassigned'}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        color: stat.color,
                        background: stat.bg,
                        border: stat.border
                      }}>
                        {asset.status}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 4px', color: 'var(--text-h)', fontSize: '16px', fontWeight: '700' }}>
                      {asset.name}
                    </h4>
                    <p style={{ margin: '0 0 12px', color: 'var(--text)', fontSize: '12px', fontFamily: 'var(--mono)' }}>
                      S/N: {asset.serialNumber}
                    </p>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '12px',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '12px',
                      marginTop: 'auto',
                      color: 'var(--text)'
                    }}>
                      <div>
                        <strong>Dept:</strong> {asset.department?.code || '—'}
                      </div>
                      <div>
                        <strong>Assigned:</strong> {asset.assignedTo?.name || '—'}
                      </div>
                    </div>

                    {/* Actions button list */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '16px',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '12px',
                      justifyContent: 'flex-end'
                    }}>
                      <Link
                        to={`/assets/${asset._id}`}
                        style={{
                          textDecoration: 'none',
                          fontSize: '12px',
                          color: 'var(--text-h)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}
                      >
                        Details
                      </Link>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => navigate(`/assets/${asset._id}/edit`)}
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
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(asset._id)}
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
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: 'var(--text-h)' }}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: 'var(--text)', padding: '0 12px' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: 'var(--text-h)' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete modal confirm block */}
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

export default AssetDirectory;
