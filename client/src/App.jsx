import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
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
          maxWidth: '500px',
          width: '90%',
          boxShadow: 'var(--shadow)',
          textAlign: 'center',
          transition: 'transform 0.3s ease'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <span style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: 'var(--accent)',
              fontWeight: 'bold',
              background: 'var(--accent-bg)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid var(--accent-border)'
            }}>
              Phase 0 – Foundation
            </span>
          </div>

          <h1 style={{
            fontSize: '42px',
            margin: '10px 0 20px',
            background: 'linear-gradient(135deg, var(--text-h), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800'
          }}>
            AssetFlow
          </h1>

          <p style={{
            fontSize: '16px',
            color: 'var(--text)',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Enterprise Asset & Resource Management ERP. Verify the link between the frontend React application and the Node.js backend server.
          </p>

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
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            {loading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Check Backend
              </>
            )}
          </button>

          {(response || error || loading) && (
            <div style={{
              marginTop: '32px',
              textAlign: 'left',
              animation: 'fadeIn 0.3s ease-in-out'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-h)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Server Response Status
              </h3>
              
              {loading && (
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'var(--code-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#eab308',
                    animation: 'pulse 1.5s infinite'
                  }}></div>
                  Pinging backend at http://localhost:5000/ ...
                </div>
              )}

              {response && (
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#22c55e',
                  fontSize: '14px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontWeight: 'bold' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                    SUCCESS (HTTP 200)
                  </div>
                  <pre style={{
                    margin: 0,
                    fontFamily: 'var(--mono)',
                    fontSize: '13px',
                    color: 'var(--text-h)',
                    overflowX: 'auto'
                  }}>
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
                  fontSize: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontWeight: 'bold' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                    ERROR
                  </div>
                  <pre style={{
                    margin: 0,
                    fontFamily: 'var(--mono)',
                    fontSize: '13px',
                    color: 'var(--text-h)',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
