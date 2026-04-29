import React, { useState } from 'react';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  const [tab, setTab] = useState('alerts');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--primary-color)', 
        padding: '0 32px',
        height: '72px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            color: '#fff',
            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px'
          }}>
            🏥
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
              Village Health Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              Supervisor Portal
            </p>
          </div>
        </div>
        
        <nav style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
          {[
            { id: 'alerts', label: 'Alerts', icon: '🔔' },
            { id: 'reports', label: 'Reports', icon: '📊' }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 20px', 
              borderRadius: 'var(--radius-md)', 
              border: 'none', 
              cursor: 'pointer',
              backgroundColor: tab === t.id ? '#fff' : 'transparent',
              color: tab === t.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.9)',
              fontWeight: 600, 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {tab === 'alerts' ? <AlertsPage /> : <ReportsPage />}
      </main>
    </div>
  );
}
