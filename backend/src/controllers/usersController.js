const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/users  — list agents (admin only)
const getAgents = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              COUNT(f.id) AS field_count
       FROM users u
       LEFT JOIN fields f ON f.assigned_agent_id = u.id
       WHERE u.role = 'agent'
       GROUP BY u.id
       ORDER BY u.name`
    );
    res.json(rows);
  } catch (err) {
    console.error('getAgents error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/users  — create agent (admin only)
const createAgent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing[0]) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'agent') RETURNING id, name, email, role, created_at`,
      [name, email.toLowerCase(), hash]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createAgent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/users/:id  — admin only
const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    if (rows[0].role === 'admin') return res.status(400).json({ error: 'Cannot delete admin users' });

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Agent deleted' });
  } catch (err) {
    console.error('deleteAgent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAgents, createAgent, deleteAgent };
