import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

/**
 * Home Page (Protected View)
 * Displays logged-in user profile, backend query option, and admin checks.
 */
function Home() {
  const { user, logout } = useAuth();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkBackend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await axios.get('http://localhost:5000/api/health');
      setResponse(res.data);
    } catch (err) {
      console.error('Error fetching from backend:', err);
      setError(err.response?.data || err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section id="center">
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '40px',
          maxWidth: '600px',
          width: '90%',
          boxShadow: 'var(--shadow)',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px', 
            borderBottom: '1px solid var(--border)', 
            paddingBottom: '16px' 
          }}>
            <h1 style={{
              fontSize: '28px',
              margin: 0,
              background: 'linear-gradient(135deg, var(--text-h), var(--accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800'
            }}>
              AssetFlow
            </h1>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-h)',
                padding: '6px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'var(--code-bg)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              Logout
            </button>
          </div>

          {/* User profile section */}
          <div style={{
            textAlign: 'left',
            background: 'var(--code-bg)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '32px',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ 
              margin: '0 0 16px', 
              color: 'var(--text-h)', 
              fontSize: '16px', 
              fontWeight: '700', 
              borderBottom: '1px solid var(--border)', 
              paddingBottom: '8px' 
            }}>
              Active Session Profile
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
              <div><strong style={{ color: 'var(--text-h)' }}>Name:</strong> <span style={{ color: 'var(--text)' }}>{user?.name}</span></div>
              <div><strong style={{ color: 'var(--text-h)' }}>Email:</strong> <span style={{ color: 'var(--text)' }}>{user?.email}</span></div>
              <div>
                <strong style={{ color: 'var(--text-h)' }}>Role:</strong>{' '}
                <span style={{ 
                  textTransform: 'uppercase', 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  color: 'var(--accent)', 
                  background: 'var(--accent-bg)', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  border: '1px solid var(--accent-border)'
                }}>
                  {user?.role}
                </span>
              </div>
              <div><strong style={{ color: 'var(--text-h)' }}>Dept:</strong> <span style={{ color: 'var(--text)' }}>{user?.department || 'General'}</span></div>
            </div>
          </div>

          {/* Health check query */}
          <button
            onClick={checkBackend}
            disabled={loading}
            className="counter"
            style={{
              padding: '12px 28px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              borderRadius: '8px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            {loading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Check Backend
              </>
            )}
          </button>

          {(response || error || loading) && (
            <div style={{ marginTop: '24px', textAlign: 'left' }}>
              {response && (
                <div style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  border: '1px solid rgba(34, 197, 94, 0.3)', 
                  color: '#22c55e', 
                  fontSize: '13px' 
                }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Server Status Response:</strong>
                  <pre style={{ margin: 0, fontFamily: 'var(--mono)', color: 'var(--text-h)', overflowX: 'auto' }}>
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              )}
              {error && (
                <div style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  color: '#ef4444', 
                  fontSize: '13px' 
                }}>
                  <strong>Query Error:</strong> {error}
                </div>
              )}
            </div>
          )}

          {/* Admin specific display block */}
          {user?.role === 'admin' && (
            <div style={{
              marginTop: '32px',
              padding: '20px',
              background: 'var(--accent-bg)',
              border: '1px dashed var(--accent-border)',
              borderRadius: '10px',
              textAlign: 'left'
            }}>
              <h3 style={{ margin: '0 0 8px', color: 'var(--accent)', fontSize: '15px', fontWeight: '700' }}>
                🛡️ Admin Control Panel
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0, lineHeight: '1.5' }}>
                This section is conditionally rendered only for users authenticated with the <strong>admin</strong> role.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

/**
 * App Main Entrance
 * Mounts Router and Auth Context wraps.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
