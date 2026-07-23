'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

export default function HealthCheckPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAPI('/api/health');
      setHealthData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>Phase 0 Foundation</div>
          <h1 style={styles.title}>System Health Check</h1>
          <p style={styles.subtitle}>QUILA STUDIOS DATA CENTER</p>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Connecting to backend API...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <div style={styles.statusBadgeError}>
              <span style={styles.statusDotError}></span>
              SYSTEM UNHEALTHY
            </div>
            <p style={styles.errorMessage}>{error}</p>
            <button style={styles.button} onClick={checkHealth}>
              Retry Connection
            </button>
          </div>
        ) : (
          <div style={styles.statusContainer}>
            <div style={styles.statusBadgeSuccess}>
              <span style={styles.statusDotSuccess}></span>
              STATUS: {healthData?.status?.toUpperCase()}
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoBox}>
                <span style={styles.infoLabel}>Backend Service</span>
                <span style={styles.infoValue}>Online (Port 4000)</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.infoLabel}>Response Time</span>
                <span style={styles.infoValue}>{new Date(healthData?.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            <div style={styles.timestampBox}>
              <span style={styles.infoLabel}>ISO Timestamp</span>
              <code style={styles.code}>{healthData?.timestamp}</code>
            </div>

            <button style={styles.button} onClick={checkHealth}>
              Refresh Health Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090d16',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    padding: '20px',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.15)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '9999px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#60a5fa',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    marginBottom: '12px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#94a3b8',
    letterSpacing: '0.1em',
    margin: 0,
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#94a3b8',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px auto',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '20px 0',
  },
  statusBadgeError: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    fontWeight: '600',
    fontSize: '14px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    marginBottom: '16px',
  },
  statusDotError: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
  },
  errorMessage: {
    color: '#cbd5e1',
    fontSize: '14px',
    marginBottom: '24px',
  },
  statusContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  statusBadgeSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    borderRadius: '12px',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#4ade80',
    fontWeight: '700',
    fontSize: '14px',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
  },
  statusDotSuccess: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    boxShadow: '0 0 8px #22c55e',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    width: '100%',
  },
  infoBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: '14px',
    color: '#f1f5f9',
    fontWeight: '600',
  },
  timestampBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    boxSizing: 'border-box',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#38bdf8',
    wordBreak: 'break-all',
  },
  button: {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
  },
};
