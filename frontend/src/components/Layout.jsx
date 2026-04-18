import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const NAV_ICON = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  fields: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  agents: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const close = () => setMobileOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--fog)' }}>

      {/* Overlay */}
      {isMobile && mobileOpen && (
        <div onClick={close} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 99,
        }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'var(--forest)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        zIndex: 100,
        transition: 'transform 0.25s ease',
        transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, paddingLeft: 6 }}>
          <span style={{ fontSize: 22 }}>🌿</span>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: '#e8f0e8' }}>SmartSeason</span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.06)', borderRadius: 10,
          padding: '10px 12px', marginBottom: 28,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--leaf)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: 14, flexShrink: 0,
          }}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mist)', lineHeight: 1.3 }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {user?.role === 'admin' ? 'Coordinator' : 'Field Agent'}
            </div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { to: '/dashboard', icon: NAV_ICON.dashboard, label: 'Dashboard' },
            { to: '/fields', icon: NAV_ICON.fields, label: 'Fields' },
            ...(user?.role === 'admin' ? [{ to: '/agents', icon: NAV_ICON.agents, label: 'Agents' }] : []),
          ].map(({ to, icon, label }) => (
            <NavLink key={to} to={to} onClick={close} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8, marginBottom: 4,
              fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
              color: isActive ? '#fff' : '#9aaa9a',
              background: isActive ? 'rgba(109,184,122,0.2)' : 'transparent',
              borderLeft: isActive ? '3px solid #6db87a' : '3px solid transparent',
              textDecoration: 'none',
            })}>
              {icon}<span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', color: 'var(--ghost)',
          fontSize: 13, padding: '10px 14px', borderRadius: 8,
          border: 'none', cursor: 'pointer', width: '100%',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: isMobile ? 0 : 240,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', background: 'var(--forest)',
            position: 'sticky', top: 0, zIndex: 50,
          }}>
            <button onClick={() => setMobileOpen(true)} style={{
              background: 'none', border: 'none', color: 'var(--mist)',
              padding: 4, display: 'flex', cursor: 'pointer',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: '#e8f0e8' }}>🌿 SmartSeason</span>
          </div>
        )}

        <div style={{ flex: 1, padding: isMobile ? '20px 16px' : '32px 36px', maxWidth: 1100 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
