const pool = require('../config/db');
const { computeStatus } = require('../models/fieldStatus');

const getDashboard = async (req, res) => {
  try {
    let fieldQuery, params;

    if (req.user.role === 'admin') {
      fieldQuery = `
        SELECT f.*, u.name AS agent_name
        FROM fields f
        LEFT JOIN users u ON f.assigned_agent_id = u.id
      `;
      params = [];
    } else {
      fieldQuery = `
        SELECT f.*, u.name AS agent_name
        FROM fields f
        LEFT JOIN users u ON f.assigned_agent_id = u.id
        WHERE f.assigned_agent_id = $1
      `;
      params = [req.user.id];
    }

    const { rows: fields } = await pool.query(fieldQuery, params);
    const enriched = fields.map(f => ({
      ...f,
      status: computeStatus(f.stage, f.planting_date, f.updated_at),
    }));

    // Stage breakdown
    const stageBreakdown = { planted: 0, growing: 0, ready: 0, harvested: 0 };
    const statusBreakdown = { active: 0, at_risk: 0, completed: 0 };

    for (const f of enriched) {
      stageBreakdown[f.stage] = (stageBreakdown[f.stage] || 0) + 1;
      statusBreakdown[f.status] = (statusBreakdown[f.status] || 0) + 1;
    }

    // Recent updates (last 10)
    let updatesQuery, updatesParams;
    if (req.user.role === 'admin') {
      updatesQuery = `
        SELECT fu.*, u.name AS agent_name, f.name AS field_name
        FROM field_updates fu
        JOIN users u ON fu.agent_id = u.id
        JOIN fields f ON fu.field_id = f.id
        ORDER BY fu.created_at DESC
        LIMIT 10
      `;
      updatesParams = [];
    } else {
      updatesQuery = `
        SELECT fu.*, u.name AS agent_name, f.name AS field_name
        FROM field_updates fu
        JOIN users u ON fu.agent_id = u.id
        JOIN fields f ON fu.field_id = f.id
        WHERE f.assigned_agent_id = $1
        ORDER BY fu.created_at DESC
        LIMIT 10
      `;
      updatesParams = [req.user.id];
    }

    const { rows: recentUpdates } = await pool.query(updatesQuery, updatesParams);

    // Admin extra: per-agent summary
    let agentSummary = [];
    if (req.user.role === 'admin') {
      const { rows: agents } = await pool.query(
        `SELECT u.id, u.name, u.email, COUNT(f.id) AS field_count
         FROM users u
         LEFT JOIN fields f ON f.assigned_agent_id = u.id
         WHERE u.role = 'agent'
         GROUP BY u.id ORDER BY u.name`
      );
      agentSummary = agents;
    }

    res.json({
      total_fields: enriched.length,
      stage_breakdown: stageBreakdown,
      status_breakdown: statusBreakdown,
      fields: enriched,
      recent_updates: recentUpdates,
      agent_summary: agentSummary,
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getDashboard };
