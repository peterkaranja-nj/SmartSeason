import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { format, formatDistanceToNow } from 'date-fns';

const STAGES = ['planted', 'growing', 'ready', 'harvested'];
const STAGE_ICONS = { planted: '🌱', growing: '🌿', ready: '🌾', harvested: '📦' };

export default function FieldDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user.role === 'admin';

  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [agents, setAgents] = useState([]);

  const fetchField = () => {
    api.get(`/fields/${id}`)
      .then(r => setField(r.data))
      .catch(() => navigate('/fields'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchField();
    if (isAdmin) api.get('/users').then(r => setAgents(r.data));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete field "${field.name}"? This cannot be undone.`)) return;
    await api.delete(`/fields/${id}`);
    navigate('/fields');
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--ghost)', fontStyle: 'italic' }}>Loading…</div>;
  if (!field) return null;

  const canUpdate = !isAdmin ? field.assigned_agent_id === user.id : true;

  return (
    <div>
      {/* Back */}
      <button style={s.backBtn} onClick={() => navigate('/fields')}>
        ← Back to Fields
      </button>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{field.name}</h1>
          <div style={s.badges}>
            <StatusBadge value={field.stage} type="stage" />
            <StatusBadge value={field.status} />
          </div>
        </div>
        <div style={s.headerActions}>
          {canUpdate && field.stage !== 'harvested' && (
            <button style={s.updateBtn} onClick={() => setShowUpdate(true)}>Update Stage</button>
          )}
          {isAdmin && (
            <>
              <button style={s.editBtn} onClick={() => setShowEdit(true)}>Edit</button>
              <button style={s.deleteBtn} onClick={handleDelete}>Delete</button>
            </>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div style={s.infoGrid}>
        <InfoCard icon="🌾" label="Crop Type" value={field.crop_type} />
        <InfoCard icon="📅" label="Planted On" value={format(new Date(field.planting_date), 'dd MMMM yyyy')} />
        {field.area_hectares && <InfoCard icon="📐" label="Area" value={`${field.area_hectares} ha`} />}
        {field.location && <InfoCard icon="📍" label="Location" value={field.location} />}
        <InfoCard icon="👤" label="Agent" value={field.agent_name || 'Unassigned'} />
        <InfoCard icon="🔄" label="Last Updated" value={formatDistanceToNow(new Date(field.updated_at), { addSuffix: true })} />
      </div>

      {/* Stage Progress */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>Stage Progress</h3>
        <div style={s.stageTrack}>
          {STAGES.map((stage, i) => {
            const currentIdx = STAGES.indexOf(field.stage);
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={stage} style={s.stageStep}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ ...s.stageCircle, background: done ? 'var(--sprout)' : active ? 'var(--forest)' : 'var(--border)', color: done || active ? '#fff' : 'var(--ghost)' }}>
                    {done ? '✓' : STAGE_ICONS[stage]}
                  </div>
                  {i < STAGES.length - 1 && (
                    <div style={{ ...s.stageLine, background: done ? 'var(--sprout)' : 'var(--border)' }} />
                  )}
                </div>
                <div style={{ ...s.stageLabel, color: active ? 'var(--forest)' : done ? 'var(--leaf)' : 'var(--ghost)', fontWeight: active ? 700 : 400 }}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Update History */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>Update History</h3>
        {field.updates?.length === 0 ? (
          <div style={{ color: 'var(--ghost)', fontSize: 14, fontStyle: 'italic' }}>No updates recorded yet.</div>
        ) : (
          <div style={s.timeline}>
            {field.updates?.map((u, i) => (
              <div key={u.id} style={s.timelineItem}>
                <div style={s.timelineDot} />
                {i < field.updates.length - 1 && <div style={s.timelineLine} />}
                <div style={s.timelineContent}>
                  <div style={s.timelineHeader}>
                    <div style={s.timelineMeta}>
                      <StatusBadge value={u.previous_stage} type="stage" size="sm" />
                      <span style={{ color: 'var(--ghost)', fontSize: 12 }}>→</span>
                      <StatusBadge value={u.new_stage} type="stage" size="sm" />
                    </div>
                    <span style={s.timelineTime}>{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</span>
                  </div>
                  <div style={s.timelineAgent}>by {u.agent_name}</div>
                  {u.notes && <div style={s.timelineNotes}>{u.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showUpdate && (
        <UpdateModal
          field={field}
          onClose={() => setShowUpdate(false)}
          onUpdated={() => { setShowUpdate(false); fetchField(); }}
        />
      )}
      {showEdit && (
        <EditModal
          field={field}
          agents={agents}
          onClose={() => setShowEdit(false)}
          onUpdated={() => { setShowEdit(false); fetchField(); }}
        />
      )}
    </div>
  );
}

const InfoCard = ({ icon, label, value }) => (
  <div style={{ background: '#fff', borderRadius: 10, padding: '14px 18px', boxShadow: 'var(--shadow)' }}>
    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{value}</div>
  </div>
);

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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={m.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={m.modal}>
        <div style={m.header}>
          <h2 style={m.title}>Update Field Stage</h2>
          <button style={m.close} onClick={onClose}>✕</button>
        </div>
        <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--dusk)' }}>
          Current stage: <StatusBadge value={field.stage} type="stage" />
        </div>
        {error && <div style={m.error}>{error}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={m.label}>New Stage *</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {nextStages.map(stage => (
                <button key={stage} type="button" onClick={() => setNewStage(stage)}
                  style={{ ...m.stageOption, background: newStage === stage ? 'var(--forest)' : '#fff', color: newStage === stage ? '#fff' : 'var(--ink)', borderColor: newStage === stage ? 'var(--forest)' : 'var(--border)' }}>
                  {STAGE_ICONS[stage]} {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={m.label}>Observations / Notes</label>
            <textarea style={m.textarea} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe what you observed in the field…" rows={4} />
          </div>
          <div style={m.actions}>
            <button type="button" style={m.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={m.submitBtn} disabled={saving || !newStage}>{saving ? 'Saving…' : 'Save Update'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditModal({ field, agents, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: field.name, crop_type: field.crop_type,
    planting_date: field.planting_date?.slice(0, 10),
    area_hectares: field.area_hectares || '',
    location: field.location || '',
    assigned_agent_id: field.assigned_agent_id || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/fields/${field.id}`, {
        ...form,
        area_hectares: form.area_hectares ? parseFloat(form.area_hectares) : null,
        assigned_agent_id: form.assigned_agent_id ? parseInt(form.assigned_agent_id) : null,
      });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={m.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={m.modal}>
        <div style={m.header}>
          <h2 style={m.title}>Edit Field</h2>
          <button style={m.close} onClick={onClose}>✕</button>
        </div>
        {error && <div style={m.error}>{error}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={m.label}>Name</label><input style={m.input} value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><label style={m.label}>Crop Type</label><input style={m.input} value={form.crop_type} onChange={e => set('crop_type', e.target.value)} /></div>
            <div><label style={m.label}>Planting Date</label><input style={m.input} type="date" value={form.planting_date} onChange={e => set('planting_date', e.target.value)} /></div>
            <div><label style={m.label}>Area (ha)</label><input style={m.input} type="number" step="0.01" value={form.area_hectares} onChange={e => set('area_hectares', e.target.value)} /></div>
          </div>
          <div><label style={m.label}>Location</label><input style={m.input} value={form.location} onChange={e => set('location', e.target.value)} /></div>
          <div>
            <label style={m.label}>Assign Agent</label>
            <select style={m.input} value={form.assigned_agent_id} onChange={e => set('assigned_agent_id', e.target.value)}>
              <option value="">Unassigned</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div style={m.actions}>
            <button type="button" style={m.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={m.submitBtn} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  backBtn: { background: 'none', color: 'var(--leaf)', fontSize: 14, fontWeight: 600, padding: '4px 0', marginBottom: 20, cursor: 'pointer' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontFamily: 'DM Serif Display, serif', fontSize: 30, color: 'var(--forest)', marginBottom: 10 },
  badges: { display: 'flex', gap: 8 },
  headerActions: { display: 'flex', gap: 10, flexShrink: 0 },
  updateBtn: { background: 'var(--forest)', color: '#fff', padding: '9px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  editBtn: { background: '#fff', color: 'var(--dusk)', border: '1.5px solid var(--border)', padding: '9px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
  deleteBtn: { background: '#fff', color: 'var(--alert)', border: '1.5px solid #f5c6c6', padding: '9px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 },
  section: { background: '#fff', borderRadius: 12, padding: '22px 24px', boxShadow: 'var(--shadow)', marginBottom: 24 },
  sectionTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--forest)', marginBottom: 18 },
  stageTrack: { display: 'flex', alignItems: 'flex-start' },
  stageStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  stageCircle: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 },
  stageLine: { height: 3, width: 80, borderRadius: 2 },
  stageLabel: { fontSize: 12, fontWeight: 500 },
  timeline: { display: 'flex', flexDirection: 'column', gap: 0 },
  timelineItem: { display: 'flex', gap: 16, position: 'relative', paddingBottom: 20 },
  timelineDot: { width: 10, height: 10, borderRadius: '50%', background: 'var(--sprout)', marginTop: 6, flexShrink: 0 },
  timelineLine: { position: 'absolute', left: 4, top: 16, bottom: 0, width: 2, background: 'var(--border)' },
  timelineContent: { flex: 1, paddingBottom: 4 },
  timelineHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  timelineMeta: { display: 'flex', alignItems: 'center', gap: 6 },
  timelineTime: { fontSize: 12, color: 'var(--ghost)' },
  timelineAgent: { fontSize: 12, color: 'var(--ghost)', marginBottom: 6 },
  timelineNotes: { fontSize: 13, color: 'var(--dusk)', background: 'var(--fog)', borderRadius: 8, padding: '10px 14px', lineHeight: 1.6 },
};

const m = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 },
  modal: { background: '#fff', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--forest)' },
  close: { background: 'none', fontSize: 18, color: 'var(--ghost)', cursor: 'pointer', padding: 4 },
  error: { background: '#fdf0f0', border: '1px solid #f5c6c6', color: '#c0392b', padding: '10px 14px', borderRadius: 8, fontSize: 14, marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dusk)', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, color: 'var(--ink)', background: '#fff' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, color: 'var(--ink)', resize: 'vertical', background: '#fff' },
  stageOption: { padding: '9px 18px', borderRadius: 8, border: '1.5px solid', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { padding: '10px 18px', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--dusk)', fontSize: 14, cursor: 'pointer' },
  submitBtn: { padding: '10px 22px', borderRadius: 8, background: 'var(--forest)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};
