const pool = require('../config/db');
const { computeStatus } = require('../models/fieldStatus');

const enrichField = (field) => ({
  ...field,
  status: computeStatus(field.stage, field.planting_date, field.updated_at),
});

// GET /api/fields  — admin sees all, agent sees assigned only
const getFields = async (req, res) => {
  try {
    let query, params;

    if (req.user.role === 'admin') {
      query = `
        SELECT f.*, 
               u.name AS agent_name, u.email AS agent_email
        FROM fields f
        LEFT JOIN users u ON f.assigned_agent_id = u.id
        ORDER BY f.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT f.*,
               u.name AS agent_name, u.email AS agent_email
        FROM fields f
        LEFT JOIN users u ON f.assigned_agent_id = u.id
        WHERE f.assigned_agent_id = $1
        ORDER BY f.created_at DESC
      `;
      params = [req.user.id];
    }

    const { rows } = await pool.query(query, params);
    res.json(rows.map(enrichField));
  } catch (err) {
    console.error('getFields error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/fields/:id
const getField = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT f.*, u.name AS agent_name, u.email AS agent_email
       FROM fields f
       LEFT JOIN users u ON f.assigned_agent_id = u.id
       WHERE f.id = $1`,
      [id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Field not found' });

    // Agents can only view their assigned fields
    if (req.user.role === 'agent' && rows[0].assigned_agent_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch update history
    const { rows: updates } = await pool.query(
      `SELECT fu.*, u.name AS agent_name
       FROM field_updates fu
       JOIN users u ON fu.agent_id = u.id
       WHERE fu.field_id = $1
       ORDER BY fu.created_at DESC`,
      [id]
    );

    res.json({ ...enrichField(rows[0]), updates });
  } catch (err) {
    console.error('getField error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/fields  — admin only
const createField = async (req, res) => {
  try {
    const { name, crop_type, planting_date, area_hectares, location, assigned_agent_id } = req.body;

    if (!name || !crop_type || !planting_date) {
      return res.status(400).json({ error: 'Name, crop type, and planting date are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO fields (name, crop_type, planting_date, area_hectares, location, assigned_agent_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, crop_type, planting_date, area_hectares || null, location || null, assigned_agent_id || null, req.user.id]
    );

    res.status(201).json(enrichField(rows[0]));
  } catch (err) {
    console.error('createField error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/fields/:id  — admin only (update assignment, metadata)
const updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, crop_type, planting_date, area_hectares, location, assigned_agent_id } = req.body;

    const { rows: existing } = await pool.query('SELECT * FROM fields WHERE id = $1', [id]);
    if (!existing[0]) return res.status(404).json({ error: 'Field not found' });

    const { rows } = await pool.query(
      `UPDATE fields SET
         name = COALESCE($1, name),
         crop_type = COALESCE($2, crop_type),
         planting_date = COALESCE($3, planting_date),
         area_hectares = COALESCE($4, area_hectares),
         location = COALESCE($5, location),
         assigned_agent_id = $6,
         updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [name, crop_type, planting_date, area_hectares, location, assigned_agent_id ?? existing[0].assigned_agent_id, id]
    );

    res.json(enrichField(rows[0]));
  } catch (err) {
    console.error('updateField error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/fields/:id  — admin only
const deleteField = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM fields WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Field not found' });
    res.json({ message: 'Field deleted' });
  } catch (err) {
    console.error('deleteField error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/fields/:id/updates  — agents (and admins) can add updates
const addUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_stage, notes } = req.body;

    const { rows: fieldRows } = await pool.query('SELECT * FROM fields WHERE id = $1', [id]);
    if (!fieldRows[0]) return res.status(404).json({ error: 'Field not found' });

    const field = fieldRows[0];

    // Agents can only update their assigned field
    if (req.user.role === 'agent' && field.assigned_agent_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!new_stage) {
      return res.status(400).json({ error: 'new_stage is required' });
    }

    const validStages = ['planted', 'growing', 'ready', 'harvested'];
    if (!validStages.includes(new_stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    // Record the update
    const { rows: updateRows } = await pool.query(
      `INSERT INTO field_updates (field_id, agent_id, previous_stage, new_stage, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, req.user.id, field.stage, new_stage, notes || null]
    );

    // Update field stage
    await pool.query(
      `UPDATE fields SET stage = $1, updated_at = NOW() WHERE id = $2`,
      [new_stage, id]
    );

    res.status(201).json(updateRows[0]);
  } catch (err) {
    console.error('addUpdate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getFields, getField, createField, updateField, deleteField, addUpdate };
