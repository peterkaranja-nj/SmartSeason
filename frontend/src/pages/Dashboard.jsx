import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{ ...s.statCard, borderTop: `3px solid ${accent}` }}>
    <div style={{ fontSize: 32, fontFamily: 'DM Serif Display, serif', color: 'var(--forest)' }}>{value}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dusk)', marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--ghost)', marginTop: 4 }}>{sub}</div>}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.loader}>Loading dashboard…</div>;
  if (!data) return null;

  const isAdmin = user.role === 'admin';
  const { total_fields, stage_breakdown, status_breakdown, recent_updates, agent_summary } = data;
  const atRisk = status_breakdown.at_risk || 0;

  return (
    <div>
      {/* Header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Good {greeting()}, {user.name.split(' ')[0]}</h1>
          <p style={s.pageSub}>{isAdmin ? 'Here\'s your farm overview for today.' : 'Here are your assigned fields.'}</p>
        </div>
        {isAdmin && (
          <button style={s.addBtn} onClick={() => navigate('/fields')}>
            + New Field
          </button>
        )}
      </div>

      {/* At-risk alert */}
      {atRisk > 0 && (
        <div style={s.alertBanner}>
          <span>⚠️</span>
          <span><strong>{atRisk} field{atRisk > 1 ? 's' : ''} at risk</strong> — review and take action.</span>
          <button style={s.alertLink} onClick={() => navigate('/fields?status=at_risk')}>View fields →</button>
        </div>
      )}

      {/* Stat cards */}
      <div style={s.statsGrid}>
        <StatCard label="Total Fields" value={total_fields} accent="var(--leaf)" />
        <StatCard label="Active" value={status_breakdown.active || 0} sub="Progressing normally" accent="var(--sprout)" />
        <StatCard label="At Risk" value={atRisk} sub="Need attention" accent="#e07b2a" />
        <StatCard label="Completed" value={status_breakdown.completed || 0} sub="Harvested" accent="#9b59b6" />
      </div>

      {/* Stage breakdown */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>Stage Breakdown</h3>
        <div style={s.stageGrid}>
          {[
            { key: 'planted', label: 'Planted', color: '#d4a017', bg: '#fdf8e8' },
            { key: 'growing', label: 'Growing', color: '#4caf6a', bg: '#e8f5eb' },
            { key: 'ready',   label: 'Ready',   color: '#2ecc71', bg: '#edf8f0' },
            { key: 'harvested', label: 'Harvested', color: '#9b59b6', bg: '#ede8f5' },
          ].map(({ key, label, color, bg }) => {
            const count = stage_breakdown[key] || 0;
            const pct = total_fields > 0 ? Math.round((count / total_fields) * 100) : 0;
            return (
              <div key={key} style={{ ...s.stageCard, background: bg }}>
                <div style={{ fontSize: 24, fontFamily: 'DM Serif Display, serif', color: 'var(--forest)' }}>{count}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color }}>{label}</div>
                <div style={s.stageBar}>
                  <div style={{ ...s.stageBarFill, width: `${pct}%`, background: color }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--ghost)' }}>{pct}% of total</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={s.twoCol}>
        {/* Recent Activity */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>Recent Activity</h3>
          {recent_updates.length === 0
            ? <div style={s.empty}>No updates yet.</div>
            : recent_updates.map(u => (
              <div key={u.id} style={s.activityItem} onClick={() => navigate(`/fields/${u.field_id}`)}>
                <div style={s.activityDot} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.activityField}>{u.field_name}</div>
                  <div style={s.activityMeta}>
                    <StatusBadge value={u.previous_stage} type="stage" size="sm" />
                    <span style={{ color: 'var(--ghost)', fontSize: 12 }}>→</span>
                    <StatusBadge value={u.new_stage} type="stage" size="sm" />
                  </div>
                  {u.notes && <div style={s.activityNotes}>{u.notes.slice(0, 80)}{u.notes.length > 80 ? '…' : ''}</div>}
                </div>
                <div style={s.activityTime}>{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</div>
              </div>
            ))
          }
        </div>

        {/* Admin: Agent Summary */}
        {isAdmin && agent_summary.length > 0 && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>Agent Summary</h3>
            {agent_summary.map(a => (
              <div key={a.id} style={s.agentRow}>
                <div style={s.agentAvatar}>{a.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ghost)' }}>{a.email}</div>
                </div>
                <div style={s.agentCount}>{a.field_count} field{a.field_count !== '1' ? 's' : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

const s = {
  loader: { padding: 40, color: 'var(--ghost)', fontStyle: 'italic' },
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 },
  pageTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 30, color: 'var(--forest)', marginBottom: 4 },
  pageSub: { fontSize: 15, color: 'var(--ghost)' },
  addBtn: {
    background: 'var(--forest)', color: '#fff',
    padding: '10px 18px', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    flexShrink: 0,
  },
  alertBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#fff8f0', border: '1px solid #f5d5a8',
    borderRadius: 10, padding: '12px 16px', marginBottom: 24,
    fontSize: 14, color: '#b85c00',
  },
  alertLink: { background: 'none', color: '#b85c00', fontWeight: 600, fontSize: 14, marginLeft: 'auto', textDecoration: 'underline' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '20px 22px',
    boxShadow: 'var(--shadow)',
  },
  section: { background: '#fff', borderRadius: 12, padding: '22px 24px', boxShadow: 'var(--shadow)', marginBottom: 24 },
  sectionTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--forest)', marginBottom: 16 },
  stageGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  stageCard: { borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 },
  stageBar: { height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  stageBarFill: { height: '100%', borderRadius: 2, transition: 'width 0.3s' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  empty: { color: 'var(--ghost)', fontSize: 14, fontStyle: 'italic', padding: '12px 0' },
  activityItem: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '12px 0', borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
  },
  activityDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--sprout)', marginTop: 5, flexShrink: 0 },
  activityField: { fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 },
  activityMeta: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  activityNotes: { fontSize: 12, color: 'var(--ghost)', marginTop: 2 },
  activityTime: { fontSize: 11, color: 'var(--ghost)', flexShrink: 0, marginTop: 2 },
  agentRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 0', borderBottom: '1px solid var(--border)',
  },
  agentAvatar: {
    width: 36, height: 36, borderRadius: 8, background: 'var(--leaf)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 600, flexShrink: 0,
  },
  agentCount: {
    fontSize: 12, fontWeight: 600, color: 'var(--leaf)',
    background: '#e8f5eb', padding: '4px 10px', borderRadius: 20,
  },
};
