import React, { useState } from 'react';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  const [tab, setTab] = useState('alerts');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1B5E20', padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>
            🏥 Village Health Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
            Doctor / Supervisor Portal
          </p>
        </div>
        <nav style={{ display: 'flex', gap: 8 }}>
          {['alerts', 'reports'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              backgroundColor: tab === t ? '#fff' : 'rgba(255,255,255,0.15)',
              color: tab === t ? '#1B5E20' : '#fff',
              fontWeight: 700, fontSize: 14, textTransform: 'capitalize',
            }}>
              {t === 'alerts' ? '🔔 Alerts' : '📊 Reports'}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        {tab === 'alerts' ? <AlertsPage /> : <ReportsPage />}
      </main>
    </div>
  );
}
