import { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchAgents = () => {
    api.get('/users').then(r => setAgents(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleDelete = async (agent) => {
    if (!window.confirm(`Remove agent "${agent.name}"? Their fields will become unassigned.`)) return;
    await api.delete(`/users/${agent.id}`);
    fetchAgents();
  };

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Field Agents</h1>
          <p style={s.sub}>{agents.length} agent{agents.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button style={s.addBtn} onClick={() => setShowModal(true)}>+ Add Agent</button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--ghost)', fontStyle: 'italic', padding: '20px 0' }}>Loading agents…</div>
      ) : agents.length === 0 ? (
        <div style={s.emptyState}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
          <div style={{ fontWeight: 600, color: 'var(--dusk)', marginBottom: 6 }}>No agents yet</div>
          <div style={{ fontSize: 14, color: 'var(--ghost)' }}>Add a field agent to start assigning fields.</div>
        </div>
      ) : (
        <div style={s.grid}>
          {agents.map(agent => (
            <div key={agent.id} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.avatar}>{agent.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={s.name}>{agent.name}</div>
                  <div style={s.email}>{agent.email}</div>
                </div>
                <button style={s.deleteBtn} onClick={() => handleDelete(agent)} title="Remove agent">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                  </svg>
                </button>
              </div>
              <div style={s.cardStats}>
                <div style={s.stat}>
                  <span style={s.statVal}>{agent.field_count}</span>
                  <span style={s.statLabel}>Assigned Fields</span>
                </div>
                <div style={s.statDivider} />
                <div style={s.stat}>
                  <span style={s.statVal}>—</span>
                  <span style={s.statLabel}>Active Updates</span>
                </div>
              </div>
              <div style={s.cardFooter}>
                Joined {format(new Date(agent.created_at), 'MMM yyyy')}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddAgentModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchAgents(); }}
        />
      )}
    </div>
  );
}

function AddAgentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/users', form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create agent');
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={m.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={m.modal}>
        <div style={m.header}>
          <h2 style={m.title}>Add Field Agent</h2>
          <button style={m.close} onClick={onClose}>✕</button>
        </div>
        {error && <div style={m.error}>{error}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={m.label}>Full Name *</label>
            <input style={m.input} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. James Okafor" autoFocus />
          </div>
          <div>
            <label style={m.label}>Email Address *</label>
            <input style={m.input} type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="agent@smartseason.com" />
          </div>
          <div>
            <label style={m.label}> Password *</label>
            <input style={m.input} type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Min 6 characters" minLength={6} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--ghost)', background: 'var(--fog)', borderRadius: 8, padding: '10px 12px' }}>
            The agent will use these credentials to log in. You can share them securely.
          </div>
          <div style={m.actions}>
            <button type="button" style={m.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={m.submitBtn} disabled={saving}>{saving ? 'Creating…' : 'Create Agent'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontFamily: 'DM Serif Display, serif', fontSize: 30, color: 'var(--forest)', marginBottom: 4 },
  sub: { fontSize: 14, color: 'var(--ghost)' },
  addBtn: { background: 'var(--forest)', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: { background: '#fff', borderRadius: 12, padding: '20px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 16 },
  cardTop: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 10, background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, flexShrink: 0 },
  name: { fontSize: 15, fontWeight: 700, color: 'var(--ink)' },
  email: { fontSize: 12, color: 'var(--ghost)', fontFamily: 'DM Mono, monospace', marginTop: 2 },
  deleteBtn: { background: '#fff8f8', border: '1px solid #f5c6c6', color: 'var(--alert)', padding: 7, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 },
  cardStats: { display: 'flex', alignItems: 'center', background: 'var(--fog)', borderRadius: 8, padding: '12px 16px' },
  stat: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statVal: { fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--forest)' },
  statLabel: { fontSize: 11, color: 'var(--ghost)', textAlign: 'center' },
  statDivider: { width: 1, height: 36, background: 'var(--border)' },
  cardFooter: { fontSize: 12, color: 'var(--ghost)' },
  emptyState: { background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: 'var(--shadow)' },
};

const m = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 },
  modal: { background: '#fff', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--forest)' },
  close: { background: 'none', fontSize: 18, color: 'var(--ghost)', cursor: 'pointer', padding: 4 },
  error: { background: '#fdf0f0', border: '1px solid #f5c6c6', color: '#c0392b', padding: '10px 14px', borderRadius: 8, fontSize: 14, marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, color: 'var(--ink)', background: '#fff' },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { padding: '10px 18px', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--dusk)', fontSize: 14, cursor: 'pointer' },
  submitBtn: { padding: '10px 22px', borderRadius: 8, background: 'var(--forest)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};
