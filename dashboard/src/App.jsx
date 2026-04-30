import React, { useState, useEffect, useRef } from 'react';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import HeatmapPage from './pages/HeatmapPage';
import SettingsPage from './pages/SettingsPage';
import CommandStrip from './components/CommandStrip';
import { subscribeToAlerts } from './services/alertService';
import { playAlertSound } from './services/audioService';

// ── Error Boundary ──────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Dashboard error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', gap: '16px', padding: '40px', textAlign: 'center',
          fontFamily: 'Inter, sans-serif', backgroundColor: '#F5F5F5',
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#212121', margin: 0 }}>Something went wrong</h2>
          <p style={{ color: '#757575', maxWidth: '400px', lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button onClick={() => window.location.reload()} style={{
            padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: '#1B5E20', color: '#fff', fontWeight: 600, fontSize: '14px',
          }}>Reload Dashboard</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── App ─────────────────────────────────────────────────────────────────────────

function AppContent() {
  const [tab, setTab] = useState('alerts');

  // Single Firestore alert subscription — shared by AlertsPage & CommandStrip
  const [alerts, setAlerts] = useState([]);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const unsub = subscribeToAlerts((allAlerts, changes) => {
      setAlerts(allAlerts);
      // Play sound for new high-risk alerts (skip initial load)
      if (!isFirstLoad.current) {
        const added = changes.filter(c => c.type === 'added');
        const hasNewHigh = added.some(c => c.doc.data().risk_level === 'high');
        if (hasNewHigh) playAlertSound();
      }
      isFirstLoad.current = false;
    });
    return () => unsub();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ══ HEADER — Command-Center Navigation ══════════════════════════ */}
      <header className="dashboard-header">
        {/* Layer 1: Identity Bar */}
        <div className="header-identity">
          <div className="header-brand">
            <div className="header-logo">
              <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                <rect width="28" height="28" rx="8" fill="rgba(255,255,255,0.12)" />
                <path d="M14 4L14 24M9 8L19 8M7 14H21M9 20H19" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="14" cy="14" r="3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2"/>
              </svg>
            </div>
            <div className="header-titles">
              <h1 className="header-app-name">
                Village Health Dashboard
              </h1>
              <div className="header-subtitle-row">
                <span className="header-badge">SUPERVISOR</span>
                <span className="header-region">District Operations Portal</span>
              </div>
            </div>
          </div>

          {/* Live Status Dot */}
          <div className="header-live-status">
            <span className="header-live-dot" />
            <span className="header-live-text">LIVE</span>
          </div>
        </div>

        {/* Layer 2: Navigation Bar */}
        <nav className="header-nav">
          <div className="header-nav-inner">
            {[
              { id: 'alerts', label: 'Alerts', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>) },
              { id: 'reports', label: 'Reports', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>) },
              { id: 'heatmap', label: 'Heatmap', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>) },
              { id: 'settings', label: 'Settings', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>) },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`header-nav-btn${tab === t.id ? ' active' : ''}`}
              >
                <span className="header-nav-icon">{t.icon}</span>
                <span className="header-nav-label">{t.label}</span>
                {t.id === 'alerts' && alerts.filter(a => a.risk_level === 'high' && a.status !== 'acknowledged').length > 0 && (
                  <span className="header-nav-badge">{alerts.filter(a => a.risk_level === 'high' && a.status !== 'acknowledged').length}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Layer 3: Accent Line */}
        <div className="header-accent-line" />
      </header>

      <CommandStrip alerts={alerts} />

      {/* Content */}
      <main style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {tab === 'alerts' ? <AlertsPage alerts={alerts} /> : tab === 'reports' ? <ReportsPage /> : tab === 'settings' ? <SettingsPage /> : <HeatmapPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
