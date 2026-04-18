import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

const STAGES = ['planted', 'growing', 'ready', 'harvested'];
const STATUSES = ['active', 'at_risk', 'completed'];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
};

export default function Fields() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const isAdmin = user.role === 'admin';

  const [fields, setFields] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [showModal, setShowModal] = useState(false);

  const fetchFields = () => api.get('/fields').then(r => setFields(r.data)).finally(() => setLoading(false));

  useEffect(() => {
    fetchFields();
    if (isAdmin) api.get('/users').then(r => setAgents(r.data));
  }, [isAdmin]);

  const filtered = fields.filter(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.crop_type.toLowerCase().includes(search.toLowerCase())) return false;
    if (stageFilter && f.stage !== stageFilter) return false;
    if (statusFilter && f.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: isMobile ? 24 : 30, color: 'var(--forest)', marginBottom: 4 }}>Fields</h1>
          <p style={{ fontSize: 14, color: 'var(--ghost)' }}>{isAdmin ? `${fields.length} total fields` : `${fields.length} assigned to you`}</p>
        </div>
        {isAdmin && (
          <button style={{ background: 'var(--forest)', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', flexShrink: 0 }} onClick={() => setShowModal(true)}>
            + Add
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Search name or crop…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 140, padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, background: '#fff' }}
        />
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{ padding: '9px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, background: '#fff', color: 'var(--ink)' }}>
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '9px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, background: '#fff', color: 'var(--ink)' }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s === 'at_risk' ? 'At Risk' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        {(search || stageFilter || statusFilter) && (
          <button style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--dusk)', fontSize: 13, cursor: 'pointer' }} onClick={() => { setSearch(''); setStageFilter(''); setStatusFilter(''); }}>Clear</button>
        )}
      </div>

      {loading ? (
        <div style={{ color: 'var(--ghost)', fontStyle: 'italic' }}>Loading fields…</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🌱</div>
          <div style={{ fontWeight: 600, color: 'var(--dusk)', marginBottom: 6 }}>No fields found</div>
          <div style={{ fontSize: 14, color: 'var(--ghost)' }}>{fields.length === 0 ? 'No fields have been created yet.' : 'Try adjusting your filters.'}</div>
        </div>
      ) : isMobile ? (
        /* Mobile: card list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(f => (
            <div key={f.id} onClick={() => navigate(`/fields/${f.id}`)} style={{ background: '#fff', borderRadius: 12, padding: '16px', boxShadow: 'var(--shadow)', cursor: 'pointer', borderLeft: '4px solid var(--leaf)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--forest)' }}>{f.name}</div>
                <StatusBadge value={f.status} size="sm" />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ background: '#f0f8ff', color: '#2c5f8a', padding: '2px 9px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{f.crop_type}</span>
                <StatusBadge value={f.stage} type="stage" size="sm" />
              </div>
              <div style={{ fontSize: 12, color: 'var(--ghost)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>📅 {format(new Date(f.planting_date), 'dd MMM yyyy')}</span>
                {f.agent_name && <span>👤 {f.agent_name}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop: table */
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Field', 'Crop', 'Planted', 'Stage', 'Status', isAdmin ? 'Agent' : null, ''].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', background: 'var(--fog)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} onClick={() => navigate(`/fields/${f.id}`)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--forest)', fontSize: 14 }}>{f.name}</div>
                    {f.location && <div style={{ fontSize: 12, color: 'var(--ghost)' }}>{f.location}</div>}
                  </td>
                  <td style={{ padding: '13px 16px' }}><span style={{ background: '#f0f8ff', color: '#2c5f8a', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{f.crop_type}</span></td>
                  <td style={{ padding: '13px 16px', fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--dusk)' }}>{format(new Date(f.planting_date), 'dd MMM yyyy')}</td>
                  <td style={{ padding: '13px 16px' }}><StatusBadge value={f.stage} type="stage" /></td>
                  <td style={{ padding: '13px 16px' }}><StatusBadge value={f.status} /></td>
                  {isAdmin && (
                    <td style={{ padding: '13px 16px' }}>
                      {f.agent_name
                        ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--dusk)' }}>
                            <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--leaf)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{f.agent_name[0]}</span>
                            {f.agent_name}
                          </div>
                        : <span style={{ color: 'var(--ghost)', fontSize: 13 }}>Unassigned</span>
                      }
                    </td>
                  )}
                  <td style={{ padding: '13px 16px' }}><span style={{ color: 'var(--leaf)', fontSize: 18 }}>›</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CreateFieldModal agents={agents} onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); fetchFields(); }} />
      )}
    </div>
  );
}

function CreateFieldModal({ agents, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', crop_type: '', planting_date: '', area_hectares: '', location: '', assigned_agent_id: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/fields', { ...form, area_hectares: form.area_hectares ? parseFloat(form.area_hectares) : null, assigned_agent_id: form.assigned_agent_id ? parseInt(form.assigned_agent_id) : null });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create field');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '28px 24px', width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--forest)' }}>Add New Field</h2>
          <button style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--ghost)', cursor: 'pointer' }} onClick={onClose}>✕</button>
        </div>
        {error && <div style={{ background: '#fdf0f0', border: '1px solid #f5c6c6', color: '#c0392b', padding: '10px 14px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>{error}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Field Name *</label><input style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.name} onChange={e => set('name', e.target.value)} required /></div>
            <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Crop Type *</label><input style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.crop_type} onChange={e => set('crop_type', e.target.value)} required /></div>
            <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Planting Date *</label><input type="date" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.planting_date} onChange={e => set('planting_date', e.target.value)} required /></div>
            <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Area (ha)</label><input type="number" step="0.01" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.area_hectares} onChange={e => set('area_hectares', e.target.value)} /></div>
          </div>
          <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Location</label><input style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.location} onChange={e => set('location', e.target.value)} /></div>
          <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Assign Agent</label>
            <select style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.assigned_agent_id} onChange={e => set('assigned_agent_id', e.target.value)}>
              <option value="">Unassigned</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" style={{ padding: '10px 18px', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--dusk)', fontSize: 14, cursor: 'pointer' }} onClick={onClose}>Cancel</button>
            <button type="submit" style={{ padding: '10px 22px', borderRadius: 8, background: 'var(--forest)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none' }} disabled={saving}>{saving ? 'Creating…' : 'Create Field'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
