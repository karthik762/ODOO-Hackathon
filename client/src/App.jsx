import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Departments from './pages/Departments';
import Categories from './pages/Categories';
import Users from './pages/Users';
import api from './services/api';
import './App.css';

/**
 * Home Component (Dashboard Overview)
 */
function Home() {
  const { user } = useAuth();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkBackend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await api.get('/health');
      setResponse(res.data);
    } catch (err) {
      console.error('Error fetching from backend:', err);
      setError(err.response?.data?.message || err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-h)', fontWeight: '800' }}>Dashboard Overview</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '14px' }}>
          Welcome back to the AssetFlow Enterprise ERP dashboard
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '600px' }}>
        {/* User Card */}
        <div style={{
          background: 'var(--code-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: 'var(--shadow)',
          textAlign: 'left'
        }}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--text-h)', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Account Session Details
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
            <div><strong style={{ color: 'var(--text-h)' }}>Department:</strong> <span style={{ color: 'var(--text)' }}>{user?.department || 'General'}</span></div>
          </div>
        </div>

        {/* Backend check */}
        <div style={{
          background: 'var(--code-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: 'var(--shadow)',
          textAlign: 'left'
        }}>
          <h3 style={{ margin: '0 0 12px', color: 'var(--text-h)', fontSize: '16px', fontWeight: '700' }}>
            Backend API Link Check
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '20px', lineHeight: '1.5' }}>
            Verify connection and latency status to the Express API health check router.
          </p>
          
          <button
            onClick={checkBackend}
            disabled={loading}
            className="counter"
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            {loading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Ping Health Endpoint
              </>
            )}
          </button>

          {(response || error || loading) && (
            <div style={{ marginTop: '20px' }}>
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
        </div>
      </div>
    </div>
  );
}

/**
 * App Layout routing
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
                <Layout>
                  <Home />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/departments" 
            element={
              <PrivateRoute>
                <Layout>
                  <Departments />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/categories" 
            element={
              <PrivateRoute>
                <Layout>
                  <Categories />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={['Admin']}>
                  <Layout>
                    <Users />
                  </Layout>
                </RoleRoute>
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
