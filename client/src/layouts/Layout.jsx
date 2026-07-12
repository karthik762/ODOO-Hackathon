import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

/**
 * Layout Container
 * Integrates Sidebar navigation with main page panels and headers.
 */
const Layout = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: 'var(--bg)',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main panel container */}
      <div style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {/* Top Header navbar */}
        <header style={{
          height: '70px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '0 32px',
          background: 'var(--code-bg)',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-h)',
              padding: '8px 16px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'var(--bg)'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
          >
            Logout
          </button>
        </header>

        {/* Main scrollable section */}
        <main style={{
          flexGrow: 1,
          padding: '32px',
          overflowY: 'auto',
          boxSizing: 'border-box',
          background: 'var(--bg)',
          width: '100%'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
