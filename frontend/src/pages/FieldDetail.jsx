import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { format, formatDistanceToNow } from 'date-fns';

const STAGES = ['planted', 'growing', 'ready', 'harvested'];
const STAGE_ICONS = { planted: '🌱', growing: '🌿', ready: '🌾', harvested: '📦' };

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
};

export default function FieldDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isAdmin = user.role === 'admin';

  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [agents, setAgents] = useState([]);

  const fetchField = () => {
    api.get(`/fields/${id}`).then(r => setField(r.data)).catch(() => navigate('/fields')).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchField();
    if (isAdmin) api.get('/users').then(r => setAgents(r.data));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete field "${field.name}"?`)) return;
    await api.delete(`/fields/${id}`);
    navigate('/fields');
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--ghost)', fontStyle: 'italic' }}>Loading…</div>;
  if (!field) return null;

  const canUpdate = isAdmin || field.assigned_agent_id === user.id;

  return (
    <div>
      <button style={{ background: 'none', border: 'none', color: 'var(--leaf)', fontSize: 14, fontWeight: 600, padding: '4px 0', marginBottom: 16, cursor: 'pointer' }} onClick={() => navigate('/fields')}>
        ← Back to Fields
      </button>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: isMobile ? 24 : 30, color: 'var(--forest)' }}>{field.name}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {canUpdate && field.stage !== 'harvested' && (
              <button style={{ background: 'var(--forest)', color: '#fff', padding: '9px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none' }} onClick={() => setShowUpdate(true)}>Update Stage</button>
            )}
            {isAdmin && <>
              <button style={{ background: '#fff', color: 'var(--dusk)', border: '1.5px solid var(--border)', padding: '9px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }} onClick={() => setShowEdit(true)}>Edit</button>
              <button style={{ background: '#fff', color: 'var(--alert)', border: '1.5px solid #f5c6c6', padding: '9px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }} onClick={handleDelete}>Delete</button>
            </>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <StatusBadge value={field.stage} type="stage" />
          <StatusBadge value={field.status} />
        </div>
      </div>

      {/* Info grid — 2 cols on mobile, 3 on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '🌾', label: 'Crop Type', value: field.crop_type },
          { icon: '📅', label: 'Planted On', value: format(new Date(field.planting_date), 'dd MMM yyyy') },
          ...(field.area_hectares ? [{ icon: '📐', label: 'Area', value: `${field.area_hectares} ha` }] : []),
          ...(field.location ? [{ icon: '📍', label: 'Location', value: field.location }] : []),
          { icon: '👤', label: 'Agent', value: field.agent_name || 'Unassigned' },
          { icon: '🔄', label: 'Last Updated', value: formatDistanceToNow(new Date(field.updated_at), { addSuffix: true }) },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Stage progress */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: 'var(--shadow)', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--forest)', marginBottom: 16 }}>Stage Progress</h3>
        <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4 }}>
          {STAGES.map((stage, i) => {
            const currentIdx = STAGES.indexOf(field.stage);
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0, background: done ? 'var(--sprout)' : active ? 'var(--forest)' : 'var(--border)', color: done || active ? '#fff' : 'var(--ghost)' }}>
                    {done ? '✓' : STAGE_ICONS[stage]}
                  </div>
                  {i < STAGES.length - 1 && <div style={{ height: 3, width: isMobile ? 40 : 80, borderRadius: 2, background: done ? 'var(--sprout)' : 'var(--border)' }} />}
                </div>
                <div style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? 'var(--forest)' : done ? 'var(--leaf)' : 'var(--ghost)', whiteSpace: 'nowrap' }}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Update history */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--forest)', marginBottom: 16 }}>Update History</h3>
        {!field.updates?.length ? (
          <div style={{ color: 'var(--ghost)', fontSize: 14, fontStyle: 'italic' }}>No updates recorded yet.</div>
        ) : field.updates.map((u, i) => (
          <div key={u.id} style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--sprout)', marginTop: 4, flexShrink: 0 }} />
              {i < field.updates.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <StatusBadge value={u.previous_stage} type="stage" size="sm" />
                  <span style={{ color: 'var(--ghost)', fontSize: 12 }}>→</span>
                  <StatusBadge value={u.new_stage} type="stage" size="sm" />
                </div>
                <span style={{ fontSize: 11, color: 'var(--ghost)' }}>{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ghost)', marginBottom: 6 }}>by {u.agent_name}</div>
              {u.notes && <div style={{ fontSize: 13, color: 'var(--dusk)', background: 'var(--fog)', borderRadius: 8, padding: '10px 14px', lineHeight: 1.6 }}>{u.notes}</div>}
            </div>
          </div>
        ))}
      </div>

      {showUpdate && <UpdateModal field={field} onClose={() => setShowUpdate(false)} onUpdated={() => { setShowUpdate(false); fetchField(); }} />}
      {showEdit && <EditModal field={field} agents={agents} onClose={() => setShowEdit(false)} onUpdated={() => { setShowEdit(false); fetchField(); }} />}
    </div>
  );
}

function UpdateModal({ field, onClose, onUpdated }) {
  const currentIdx = STAGES.indexOf(field.stage);
  const nextStages = STAGES.slice(currentIdx + 1);
  const [newStage, setNewStage] = useState(nextStages[0] || '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/fields/${field.id}/updates`, { new_stage: newStage, notes });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '24px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: 'var(--forest)' }}>Update Field Stage</h2>
          <button style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--ghost)', cursor: 'pointer' }} onClick={onClose}>✕</button>
        </div>
        <div style={{ marginBottom: 14, fontSize: 14, color: 'var(--dusk)' }}>Current: <StatusBadge value={field.stage} type="stage" /></div>
        {error && <div style={{ background: '#fdf0f0', border: '1px solid #f5c6c6', color: '#c0392b', padding: '10px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 8 }}>New Stage *</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {nextStages.map(stage => (
                <button key={stage} type="button" onClick={() => setNewStage(stage)} style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: newStage === stage ? 'var(--forest)' : '#fff', color: newStage === stage ? '#fff' : 'var(--ink)', borderColor: newStage === stage ? 'var(--forest)' : 'var(--border)' }}>
                  {STAGE_ICONS[stage]} {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 6 }}>Observations / Notes</label>
            <textarea style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, resize: 'vertical', background: '#fff' }} value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Describe what you observed…" />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--dusk)', fontSize: 14, cursor: 'pointer' }} onClick={onClose}>Cancel</button>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--forest)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none' }} disabled={saving || !newStage}>{saving ? 'Saving…' : 'Save Update'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditModal({ field, agents, onClose, onUpdated }) {
  const [form, setForm] = useState({ name: field.name, crop_type: field.crop_type, planting_date: field.planting_date?.slice(0, 10), area_hectares: field.area_hectares || '', location: field.location || '', assigned_agent_id: field.assigned_agent_id || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/fields/${field.id}`, { ...form, area_hectares: form.area_hectares ? parseFloat(form.area_hectares) : null, assigned_agent_id: form.assigned_agent_id ? parseInt(form.assigned_agent_id) : null });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '24px', width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: 'var(--forest)' }}>Edit Field</h2>
          <button style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--ghost)', cursor: 'pointer' }} onClick={onClose}>✕</button>
        </div>
        {error && <div style={{ background: '#fdf0f0', border: '1px solid #f5c6c6', color: '#c0392b', padding: '10px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Name</label><input style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Crop Type</label><input style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.crop_type} onChange={e => set('crop_type', e.target.value)} /></div>
            <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Planting Date</label><input type="date" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.planting_date} onChange={e => set('planting_date', e.target.value)} /></div>
            <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Area (ha)</label><input type="number" step="0.01" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.area_hectares} onChange={e => set('area_hectares', e.target.value)} /></div>
          </div>
          <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Location</label><input style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.location} onChange={e => set('location', e.target.value)} /></div>
          <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 5 }}>Assign Agent</label>
            <select style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14 }} value={form.assigned_agent_id} onChange={e => set('assigned_agent_id', e.target.value)}>
              <option value="">Unassigned</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--dusk)', fontSize: 14, cursor: 'pointer' }} onClick={onClose}>Cancel</button>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--forest)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none' }} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
