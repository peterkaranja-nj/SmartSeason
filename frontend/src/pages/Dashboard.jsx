import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
};

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', boxShadow: 'var(--shadow)', borderTop: `3px solid ${accent}` }}>
    <div style={{ fontSize: 32, fontFamily: 'DM Serif Display, serif', color: 'var(--forest)' }}>{value}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dusk)', marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--ghost)', marginTop: 4 }}>{sub}</div>}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, color: 'var(--ghost)', fontStyle: 'italic' }}>Loading dashboard…</div>;
  if (!data) return null;

  const isAdmin = user.role === 'admin';
  const { total_fields, stage_breakdown, status_breakdown, recent_updates, agent_summary } = data;
  const atRisk = status_breakdown.at_risk || 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: isMobile ? 24 : 30, color: 'var(--forest)', marginBottom: 4 }}>
            Good {greeting()}, {user.name.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ghost)' }}>{isAdmin ? 'Here's your farm overview for today.' : 'Here are your assigned fields.'}</p>
        </div>
        {isAdmin && (
          <button style={{ background: 'var(--forest)', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', flexShrink: 0 }} onClick={() => navigate('/fields')}>
            + New Field
          </button>
        )}
      </div>

      {atRisk > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff8f0', border: '1px solid #f5d5a8', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14, color: '#b85c00', flexWrap: 'wrap' }}>
          <span>⚠️</span>
          <span><strong>{atRisk} field{atRisk > 1 ? 's' : ''} at risk</strong> — review and take action.</span>
          <button style={{ background: 'none', border: 'none', color: '#b85c00', fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'underline', padding: 0 }} onClick={() => navigate('/fields?status=at_risk')}>View fields →</button>
        </div>
      )}

      {/* Stat cards — 2 cols on mobile, 4 on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Fields" value={total_fields} accent="var(--leaf)" />
        <StatCard label="Active" value={status_breakdown.active || 0} sub="Progressing normally" accent="var(--sprout)" />
        <StatCard label="At Risk" value={atRisk} sub="Need attention" accent="#e07b2a" />
        <StatCard label="Completed" value={status_breakdown.completed || 0} sub="Harvested" accent="#9b59b6" />
      </div>

      {/* Stage breakdown — 2 cols on mobile, 4 on desktop */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '22px 24px', boxShadow: 'var(--shadow)', marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--forest)', marginBottom: 16 }}>Stage Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { key: 'planted',   label: 'Planted',   color: '#d4a017', bg: '#fdf8e8' },
            { key: 'growing',   label: 'Growing',   color: '#4caf6a', bg: '#e8f5eb' },
            { key: 'ready',     label: 'Ready',     color: '#2ecc71', bg: '#edf8f0' },
            { key: 'harvested', label: 'Harvested', color: '#9b59b6', bg: '#ede8f5' },
          ].map(({ key, label, color, bg }) => {
            const count = stage_breakdown[key] || 0;
            const pct = total_fields > 0 ? Math.round((count / total_fields) * 100) : 0;
            return (
              <div key={key} style={{ borderRadius: 10, padding: 16, background: bg, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 24, fontFamily: 'DM Serif Display, serif', color: 'var(--forest)' }}>{count}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color }}>{label}</div>
                <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--ghost)' }}>{pct}% of total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom section — stacked on mobile, side by side on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
        {/* Recent Activity */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '22px 24px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--forest)', marginBottom: 16 }}>Recent Activity</h3>
          {recent_updates.length === 0
            ? <div style={{ color: 'var(--ghost)', fontSize: 14, fontStyle: 'italic' }}>No updates yet.</div>
            : recent_updates.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate(`/fields/${u.field_id}`)}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sprout)', marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{u.field_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    <StatusBadge value={u.previous_stage} type="stage" size="sm" />
                    <span style={{ color: 'var(--ghost)', fontSize: 12 }}>→</span>
                    <StatusBadge value={u.new_stage} type="stage" size="sm" />
                  </div>
                  {u.notes && <div style={{ fontSize: 12, color: 'var(--ghost)' }}>{u.notes.slice(0, 80)}{u.notes.length > 80 ? '…' : ''}</div>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ghost)', flexShrink: 0, marginTop: 2 }}>{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</div>
              </div>
            ))
          }
        </div>

        {/* Agent Summary (admin only) */}
        {isAdmin && agent_summary.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '22px 24px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--forest)', marginBottom: 16 }}>Agent Summary</h3>
            {agent_summary.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--leaf)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>{a.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ghost)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.email}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--leaf)', background: '#e8f5eb', padding: '4px 10px', borderRadius: 20, flexShrink: 0 }}>{a.field_count} fields</div>
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
