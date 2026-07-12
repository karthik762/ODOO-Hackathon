import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Users Page (Admin Directory)
 * Provides Admin privileges to update employee roles and access statuses.
 */
const Users = () => {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Toggle Confirm
  const [statusConfirmUser, setStatusConfirmUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setError(null);
    try {
      const res = await api.patch(`/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleStatusToggle = async (userObj) => {
    setError(null);
    const newStatus = userObj.status === 'active' ? 'inactive' : 'active';
    
    // Require confirmation when disabling account
    if (newStatus === 'inactive' && !statusConfirmUser) {
      setStatusConfirmUser(userObj);
      return;
    }

    try {
      const targetUserId = statusConfirmUser?._id || userObj._id;
      const res = await api.patch(`/users/${targetUserId}/status`, { status: newStatus });
      if (res.data.success) {
        setStatusConfirmUser(null);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
      setStatusConfirmUser(null);
    }
  };

  // Filtration logic
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const getRoleStyle = (role) => {
    switch (role) {
      case 'Admin':
        return { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: '1px solid rgba(192, 132, 252, 0.4)' };
      case 'AssetManager':
        return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)' };
      case 'DepartmentHead':
        return { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)' };
      default:
        return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', border: '1px solid rgba(107, 114, 128, 0.4)' };
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-h)', fontWeight: '800' }}>Employees Directory</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '14px' }}>
            Manage staff roles, verify departments, and toggle accounts access status
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Filter search box */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name, email, or role..."
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

      {/* Directory grid table */}
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
            Loading user directory...
          </div>
        ) : currentItems.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text)' }}>
            <p style={{ fontSize: '15px' }}>No users found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.05)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Email Address</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Role Badge</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '600', textAlign: 'right' }}>Actions / Management</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((u) => {
                  const rStyle = getRoleStyle(u.role);
                  const isSelf = currentUser?._id === u._id;
                  
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px 20px', fontWeight: 'bold', color: 'var(--text-h)' }}>
                        {u.name} {isSelf && <span style={{ fontSize: '10px', color: 'var(--text)', fontStyle: 'italic', fontWeight: 'normal' }}>(You)</span>}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text)' }}>{u.email}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: rStyle.bg,
                          color: rStyle.color,
                          border: rStyle.border
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: u.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: u.status === 'active' ? '#22c55e' : '#ef4444',
                          border: u.status === 'active' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={isSelf}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              background: 'var(--bg)',
                              color: 'var(--text-h)',
                              fontSize: '12px',
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="Admin">Admin</option>
                            <option value="AssetManager">Asset Manager</option>
                            <option value="DepartmentHead">Department Head</option>
                            <option value="Employee">Employee</option>
                          </select>

                          <button
                            onClick={() => handleStatusToggle(u)}
                            disabled={isSelf}
                            style={{
                              background: u.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                              border: u.status === 'active' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              color: u.status === 'active' ? '#ef4444' : '#22c55e',
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              fontWeight: '600',
                              minWidth: '70px',
                              textAlign: 'center'
                            }}
                            onMouseOver={(e) => {
                              if (!isSelf) e.target.style.background = u.status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
                            }}
                            onMouseOut={(e) => {
                              if (!isSelf) e.target.style.background = u.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
                            }}
                          >
                            {u.status === 'active' ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination panel */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text)' }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
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

      {/* Disabling account confirm modal */}
      {statusConfirmUser && (
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
            <h3 style={{ margin: '0 0 12px', color: 'var(--text-h)', fontSize: '20px', fontWeight: '800' }}>Disable User Account?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to disable <strong>{statusConfirmUser.name}</strong> ({statusConfirmUser.email})? 
              This user will be immediately blocked from logging into AssetFlow.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setStatusConfirmUser(null)}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-h)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusToggle(statusConfirmUser)}
                style={{ padding: '8px 20px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Disable Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
