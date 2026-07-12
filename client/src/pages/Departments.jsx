import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Departments Management Page
 * Handles department creation, listing, editing, and deletion (restricted to Admins).
 */
const Departments = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form configurations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    departmentHead: '',
    status: 'active'
  });

  // Delete Confirm configurations
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!isAdmin) return; 
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setEmployees(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      code: '',
      description: '',
      departmentHead: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setIsEditMode(true);
    setCurrentId(dept._id);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      departmentHead: dept.departmentHead?._id || '',
      status: dept.status
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...formData,
        departmentHead: formData.departmentHead === '' ? null : formData.departmentHead
      };
      
      if (isEditMode) {
        const res = await api.put(`/departments/${currentId}`, payload);
        if (res.data.success) {
          setIsModalOpen(false);
          fetchDepartments();
        }
      } else {
        const res = await api.post('/departments', payload);
        if (res.data.success) {
          setIsModalOpen(false);
          fetchDepartments();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/departments/${id}`);
      if (res.data.success) {
        setDeleteConfirmId(null);
        fetchDepartments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed');
      setDeleteConfirmId(null);
    }
  };

  // Filtration logic
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase()) ||
    dept.code.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-h)', fontWeight: '800' }}>Departments</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '14px' }}>
            Manage organization units and assign department heads
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="counter"
            style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '14px', border: 'none', borderRadius: '6px' }}
          >
            + Add Department
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Filters search */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by code or name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          style={{
            flexGrow: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--code-bg)',
            color: 'var(--text-h)',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {/* Main Grid View */}
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
            Loading departments...
          </div>
        ) : currentItems.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text)' }}>
            <p style={{ fontSize: '15px' }}>No departments found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.05)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Code</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Department Head</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Description</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Status</th>
                  {isAdmin && <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((dept) => (
                  <tr key={dept._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px 20px', fontWeight: 'bold', color: 'var(--text-h)' }}>{dept.code}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-h)' }}>{dept.name}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text)' }}>{dept.departmentHead?.name || <em style={{ color: 'var(--text)', opacity: 0.5 }}>None</em>}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dept.description || '—'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        background: dept.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: dept.status === 'active' ? '#22c55e' : '#6b7280',
                        border: dept.status === 'active' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(107, 114, 128, 0.3)'
                      }}>
                        {dept.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEdit(dept)}
                            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', color: 'var(--text-h)', cursor: 'pointer' }}
                            onMouseOver={(e) => e.target.style.background = 'var(--bg)'}
                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(dept._id)}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', color: '#ef4444', cursor: 'pointer' }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                            onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination components */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text)' }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDepartments.length)} of {filteredDepartments.length} entries
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: 'var(--text-h)' }}
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: 'var(--text-h)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal View for Edit/Create */}
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
            animation: 'scaleUp 0.2s ease'
          }}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--text-h)', fontSize: '22px', fontWeight: '800' }}>
              {isEditMode ? 'Edit Department' : 'Create Department'}
            </h3>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Code *</label>
                <input
                  type="text"
                  placeholder="e.g. IT"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
                  required
                  disabled={isEditMode}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Information Technology"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Department Head</label>
                <select
                  value={formData.departmentHead}
                  onChange={(e) => setFormData({ ...formData, departmentHead: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="">Select Department Head (Optional)</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Description</label>
                <textarea
                  placeholder="Department details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', resize: 'vertical', minHeight: '80px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-h)', marginBottom: '6px' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-h)', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="counter"
                  style={{ padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {isEditMode ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
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
              Are you sure you want to delete this department? This action cannot be undone.
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

export default Departments;
