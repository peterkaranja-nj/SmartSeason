import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export default function Login() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      ...s.page,
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      {/* Left panel */}
      <div style={{
        ...s.left,
        minHeight: isMobile ? 'auto' : '100vh',
        padding: isMobile ? '48px 24px 36px' : '60px 48px'
      }}>
        <div style={s.leftInner}>
          <div style={s.brand}>🌿 SmartSeason</div>

          <h1 style={{
            ...s.tagline,
            fontSize: isMobile ? 36 : 48
          }}>
            Field monitoring
            <br />
            <em>made easy.</em>
          </h1>

          <p style={s.sub}>
            Track crop progress, manage field agents, and stay ahead of every harvest —
            all in one place.
          </p>

          <div style={s.features}>
            {[
              'Real-time stage tracking',
              'At-risk field alerts',
              'Agent assignment & oversight',
              'Harvest-ready insights'
            ].map(f => (
              <div key={f} style={s.featureItem}>
                <span style={s.check}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        ...s.right,
        width: isMobile ? '100%' : 460,
        minHeight: isMobile ? 'auto' : '100vh',
        padding: isMobile ? 24 : 40
      }}>
        <div style={{
          ...s.card,
          maxWidth: isMobile ? '100%' : 380
        }}>
          <h2 style={s.title}>Sign in</h2>
          <p style={s.hint}>Use your SmartSeason credentials</p>

          {error && <div style={s.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>Email</label>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@smartseason.com"
              style={s.input}
              required
              autoFocus
            />

            <label style={s.label}>Password</label>

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={s.input}
              required
            />

            <button
              type="submit"
              style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div style={s.divider}>
            <span style={s.dividerLine} />
            <span style={s.dividerText}>or try without an account</span>
            <span style={s.dividerLine} />
          </div>

          <div style={s.trialRow}>
            <button
              type="button"
              style={s.trialBtnAdmin}
              onClick={() => { demoLogin('admin'); navigate('/dashboard'); }}
            >
              Admin preview
            </button>
            <button
              type="button"
              style={s.trialBtnAgent}
              onClick={() => { demoLogin('agent'); navigate('/dashboard'); }}
            >
              Agent preview
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: 'flex',
    minHeight: '100vh'
  },

  left: {
    flex: 1,
    background: 'var(--forest)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  leftInner: {
    maxWidth: 420
  },

  brand: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: 22,
    color: 'var(--sprout)',
    marginBottom: 40
  },

  tagline: {
    fontFamily: 'DM Serif Display, serif',
    color: 'var(--mist)',
    lineHeight: 1.1,
    marginBottom: 20
  },

  sub: {
    fontSize: 16,
    color: 'var(--ghost)',
    lineHeight: 1.7,
    marginBottom: 36
  },

  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: 'var(--mist)',
    fontSize: 14
  },

  check: {
    color: 'var(--sprout)',
    fontWeight: 700,
    fontSize: 15
  },

  right: {
    background: 'var(--fog)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  card: {
    width: '100%'
  },

  title: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: 32,
    color: 'var(--forest)',
    marginBottom: 6
  },

  hint: {
    fontSize: 14,
    color: 'var(--ghost)',
    marginBottom: 28
  },

  errorBox: {
    background: '#fdf0f0',
    border: '1px solid #f5c6c6',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 20
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },

  label: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--dusk)',
    marginTop: 8,
    marginBottom: 4
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 14px',
    borderRadius: 8,
    fontSize: 16,
    border: '1.5px solid var(--border)',
    background: '#fff',
    color: 'var(--ink)'
  },

  btn: {
    width: '100%',
    marginTop: 16,
    padding: '14px',
    borderRadius: 8,
    background: 'var(--forest)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer'
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '24px 0 16px'
  },

  dividerLine: {
    flex: 1,
    height: 1,
    background: 'var(--border)'
  },

  dividerText: {
    fontSize: 12,
    color: 'var(--ghost)',
    whiteSpace: 'nowrap'
  },

  trialRow: {
    display: 'flex',
    gap: 10
  },

  trialBtnAdmin: {
    flex: 1,
    padding: '11px 0',
    borderRadius: 8,
    border: '1.5px solid var(--forest)',
    background: 'transparent',
    color: 'var(--forest)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  },

  trialBtnAgent: {
    flex: 1,
    padding: '11px 0',
    borderRadius: 8,
    border: '1.5px solid var(--border)',
    background: 'transparent',
    color: 'var(--dusk)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  }
};