import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

const STAGES = ['planted', 'growing', 'ready', 'harvested'];
const STATUSES = ['active', 'at_risk', 'completed'];

export default function Fields() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = user.role === 'admin';

  const [fields, setFields] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [showModal, setShowModal] = useState(false);

  const fetchFields = () => {
    api.get('/fields').then(r => setFields(r.data)).finally(() => setLoading(false));
  };

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
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Fields</h1>
          <p style={s.sub}>{isAdmin ? `${fields.length} total fields across all agents` : `${fields.length} fields assigned to you`}</p>
        </div>
        {isAdmin && (
          <button style={s.addBtn} onClick={() => setShowModal(true)}>+ Add Field</button>
        )}
      </div>

      {/* Filters */}
      <div style={s.filters}>
        <input
          placeholder="Search by name or crop…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={s.search}
        />
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={s.select}>
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={s.select}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s === 'at_risk' ? 'At Risk' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        {(search || stageFilter || statusFilter) && (
          <button style={s.clearBtn} onClick={() => { setSearch(''); setStageFilter(''); setStatusFilter(''); }}>Clear</button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={s.empty}>Loading fields…</div>
      ) : filtered.length === 0 ? (
        <div style={s.emptyState}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🌱</div>
          <div style={{ fontWeight: 600, color: 'var(--dusk)', marginBottom: 6 }}>No fields found</div>
          <div style={{ fontSize: 14, color: 'var(--ghost)' }}>{fields.length === 0 ? 'No fields have been created yet.' : 'Try adjusting your filters.'}</div>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Field', 'Crop', 'Planted', 'Stage', 'Status', isAdmin ? 'Agent' : null, ''].filter(Boolean).map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} style={s.tr} onClick={() => navigate(`/fields/${f.id}`)}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600, color: 'var(--forest)', fontSize: 14 }}>{f.name}</div>
                    {f.location && <div style={{ fontSize: 12, color: 'var(--ghost)' }}>{f.location}</div>}
                  </td>
                  <td style={s.td}>
                    <span style={s.cropTag}>{f.crop_type}</span>
                  </td>
                  <td style={{ ...s.td, fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--dusk)' }}>
                    {format(new Date(f.planting_date), 'dd MMM yyyy')}
                  </td>
                  <td style={s.td}><StatusBadge value={f.stage} type="stage" /></td>
                  <td style={s.td}><StatusBadge value={f.status} /></td>
                  {isAdmin && (
                    <td style={s.td}>
                      {f.agent_name
                        ? <div style={s.agentChip}><span style={s.agentDot}>{f.agent_name[0]}</span>{f.agent_name}</div>
                        : <span style={{ color: 'var(--ghost)', fontSize: 13 }}>Unassigned</span>
                      }
                    </td>
                  )}
                  <td style={s.td}>
                    <span style={{ color: 'var(--leaf)', fontSize: 18 }}>›</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <CreateFieldModal
          agents={agents}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchFields(); }}
        />
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
      await api.post('/fields', {
        ...form,
        area_hectares: form.area_hectares ? parseFloat(form.area_hectares) : null,
        assigned_agent_id: form.assigned_agent_id ? parseInt(form.assigned_agent_id) : null,
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create field');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={m.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={m.modal}>
        <div style={m.modalHeader}>
          <h2 style={m.modalTitle}>Add New Field</h2>
          <button style={m.closeBtn} onClick={onClose}>✕</button>
        </div>
        {error && <div style={m.error}>{error}</div>}
        <form onSubmit={submit} style={m.form}>
          <div style={m.grid2}>
            <div>
              <label style={m.label}>Field Name *</label>
              <input style={m.input} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. North Pasture A" />
            </div>
            <div>
              <label style={m.label}>Crop Type *</label>
              <input style={m.input} value={form.crop_type} onChange={e => set('crop_type', e.target.value)} required placeholder="e.g. Maize" />
            </div>
          </div>
          <div style={m.grid2}>
            <div>
              <label style={m.label}>Planting Date *</label>
              <input style={m.input} type="date" value={form.planting_date} onChange={e => set('planting_date', e.target.value)} required />
            </div>
            <div>
              <label style={m.label}>Area (hectares)</label>
              <input style={m.input} type="number" step="0.01" min="0" value={form.area_hectares} onChange={e => set('area_hectares', e.target.value)} placeholder="e.g. 12.5" />
            </div>
          </div>
          <div>
            <label style={m.label}>Location</label>
            <input style={m.input} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Block A, North" />
          </div>
          <div>
            <label style={m.label}>Assign Agent</label>
            <select style={m.input} value={form.assigned_agent_id} onChange={e => set('assigned_agent_id', e.target.value)}>
              <option value="">Unassigned</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div style={m.actions}>
            <button type="button" style={m.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={m.submitBtn} disabled={saving}>{saving ? 'Creating…' : 'Create Field'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontFamily: 'DM Serif Display, serif', fontSize: 30, color: 'var(--forest)', marginBottom: 4 },
  sub: { fontSize: 14, color: 'var(--ghost)' },
  addBtn: { background: 'var(--forest)', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
  filters: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  search: { flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, background: '#fff' },
  select: { padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, background: '#fff', color: 'var(--ink)', cursor: 'pointer' },
  clearBtn: { padding: '9px 14px', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--dusk)', fontSize: 13, cursor: 'pointer' },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', background: 'var(--fog)' },
  tr: { cursor: 'pointer', transition: 'background 0.1s', borderBottom: '1px solid var(--border)' },
  td: { padding: '13px 16px', verticalAlign: 'middle' },
  cropTag: { background: '#f0f8ff', color: '#2c5f8a', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  agentChip: { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--dusk)' },
  agentDot: { width: 24, height: 24, borderRadius: 6, background: 'var(--leaf)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  empty: { color: 'var(--ghost)', fontStyle: 'italic', padding: '20px 0' },
  emptyState: { background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: 'var(--shadow)' },
};

const m = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 },
  modal: { background: '#fff', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--forest)' },
  closeBtn: { background: 'none', fontSize: 18, color: 'var(--ghost)', cursor: 'pointer', padding: 4 },
  error: { background: '#fdf0f0', border: '1px solid #f5c6c6', color: '#c0392b', padding: '10px 14px', borderRadius: 8, fontSize: 14, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, color: 'var(--ink)', background: '#fff' },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { padding: '10px 18px', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--dusk)', fontSize: 14, cursor: 'pointer' },
  submitBtn: { padding: '10px 22px', borderRadius: 8, background: 'var(--forest)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};
