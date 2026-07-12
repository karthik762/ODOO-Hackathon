import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute Component
 * Restricts route access to users with specified authorization roles.
 */
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'var(--text)'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'var(--accent)',
          animation: 'pulse 1.5s infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{ fontSize: '14px', letterSpacing: '1px' }}>Verifying permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'var(--text)',
        textAlign: 'center',
        padding: '40px'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <h2 style={{ color: 'var(--text-h)', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ fontSize: '16px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          Your account role ({user.role}) does not have permission to view this section.
        </p>
      </div>
    );
  }

  return children;
};

export default RoleRoute;
