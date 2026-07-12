import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Sidebar Navigation Component
 * Provides access to dashboard sections and reflects user session details.
 */
const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      width: '260px',
      background: 'var(--code-bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* Title logo block */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-h)' }}>
          AssetFlow
        </h2>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 'bold' }}>
          ERP Portal
        </span>
      </div>

      {/* Main navigation links */}
      <div style={{ flexGrow: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link 
          to="/" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            color: isActive('/') ? 'var(--accent)' : 'var(--text)',
            background: isActive('/') ? 'var(--accent-bg)' : 'transparent',
            border: isActive('/') ? '1px solid var(--accent-border)' : '1px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9"/>
            <rect x="14" y="3" width="7" height="5"/>
            <rect x="14" y="12" width="7" height="9"/>
            <rect x="3" y="16" width="7" height="5"/>
          </svg>
          Dashboard
        </Link>

        {/* Section title */}
        <div style={{ padding: '16px 16px 8px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text)', fontWeight: 'bold', letterSpacing: '1px' }}>
          Organization
        </div>

        <Link 
          to="/departments" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            color: isActive('/departments') ? 'var(--accent)' : 'var(--text)',
            background: isActive('/departments') ? 'var(--accent-bg)' : 'transparent',
            border: isActive('/departments') ? '1px solid var(--accent-border)' : '1px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Departments
        </Link>

        <Link 
          to="/categories" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            color: isActive('/categories') ? 'var(--accent)' : 'var(--text)',
            background: isActive('/categories') ? 'var(--accent-bg)' : 'transparent',
            border: isActive('/categories') ? '1px solid var(--accent-border)' : '1px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Categories
        </Link>

        {user?.role === 'Admin' && (
          <Link 
            to="/users" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              color: isActive('/users') ? 'var(--accent)' : 'var(--text)',
              background: isActive('/users') ? 'var(--accent-bg)' : 'transparent',
              border: isActive('/users') ? '1px solid var(--accent-border)' : '1px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Employees
          </Link>
        )}
      </div>

      {/* User profile footer info */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.email}
        </div>
        <div style={{ display: 'inline-block', marginTop: '6px' }}>
          <span style={{ 
            fontSize: '9px', 
            textTransform: 'uppercase', 
            fontWeight: 'bold', 
            background: 'var(--accent-bg)', 
            color: 'var(--accent)', 
            border: '1px solid var(--accent-border)', 
            padding: '2px 6px', 
            borderRadius: '10px' 
          }}>
            {user?.role}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
