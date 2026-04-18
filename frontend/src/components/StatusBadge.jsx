const CONFIG = {
  active:    { label: 'Active',    bg: '#e8f5eb', color: '#2d7a3a', dot: '#4caf6a' },
  at_risk:   { label: 'At Risk',   bg: '#fdf0e8', color: '#b85c00', dot: '#e07b2a' },
  completed: { label: 'Completed', bg: '#e8eef8', color: '#2c4f8c', dot: '#4a7fd4' },
};

const STAGE_CONFIG = {
  planted:   { label: 'Planted',   bg: '#fdf8e8', color: '#8b6914', dot: '#d4a017' },
  growing:   { label: 'Growing',   bg: '#e8f5eb', color: '#2d7a3a', dot: '#4caf6a' },
  ready:     { label: 'Ready',     bg: '#edf8f0', color: '#1a6e3c', dot: '#2ecc71' },
  harvested: { label: 'Harvested', bg: '#ede8f5', color: '#5b3d8c', dot: '#9b59b6' },
};

export default function StatusBadge({ value, type = 'status', size = 'md' }) {
  const map = type === 'stage' ? STAGE_CONFIG : CONFIG;
  const cfg = map[value] || { label: value, bg: '#f0f0f0', color: '#666', dot: '#999' };
  const pad = size === 'sm' ? '3px 9px' : '4px 12px';
  const fs = size === 'sm' ? 11 : 12;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: cfg.bg, color: cfg.color,
      padding: pad, borderRadius: 20,
      fontSize: fs, fontWeight: 600, letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}
