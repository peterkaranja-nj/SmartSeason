const pool = require('./db');
const bcrypt = require('bcryptjs');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM field_updates');
    await client.query('DELETE FROM fields');
    await client.query('DELETE FROM users');
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE fields_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE field_updates_id_seq RESTART WITH 1');

    // Create admin user
    const adminHash = await bcrypt.hash('admin123', 10);
    const { rows: [admin] } = await client.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Peter Admin', 'admin@smartseason.com', adminHash, 'admin']
    );

    // Create field agents
    const agent1Hash = await bcrypt.hash('agent123', 10);
    const { rows: [agent1] } = await client.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['James Okafor', 'james@smartseason.com', agent1Hash, 'agent']
    );

    const agent2Hash = await bcrypt.hash('agent123', 10);
    const { rows: [agent2] } = await client.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Amina Diallo', 'amina@smartseason.com', agent2Hash, 'agent']
    );

    const agent3Hash = await bcrypt.hash('agent123', 10);
    const { rows: [agent3] } = await client.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Kwame Mensah', 'kwame@smartseason.com', agent3Hash, 'agent']
    );

    const agent4Hash = await bcrypt.hash('agent123', 10);
    const { rows: [agent4] } = await client.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Ngangi Musembi', 'ngangi@smartseason.com', agent4Hash, 'agent']
    );
    // Create fields
    const fields = [
      { name: 'North Pasture A', crop: 'Maize', date: '2026-01-15', area: 12.5, location: 'Block A, Northlands', stage: 'ready', agent: agent1.id },
      { name: 'South Ridge B', crop: 'Soybean', date: '2026-02-01', area: 8.3, location: 'Block B, Taita', stage: 'growing', agent: agent1.id },
      { name: 'East Valley C', crop: 'Wheat', date: '2025-11-20', area: 15.0, location: 'Block C, Narok', stage: 'harvested', agent: agent2.id },
      { name: 'West Plot D', crop: 'Sorghum', date: '2026-02-10', area: 6.7, location: 'Block D, Western', stage: 'planted', agent: agent2.id },
      { name: 'Central Field E', crop: 'Cassava', date: '2026-01-05', area: 20.0, location: 'Block E, Central', stage: 'growing', agent: agent3.id },
      { name: 'Hilltop F', crop: 'Millet', date: '2026-02-20', area: 4.2, location: 'Block F, Kajiado', stage: 'planted', agent: agent3.id },
      { name: 'Riverside G', crop: 'Rice', date: '2026-01-25', area: 18.0, location: 'Block G, Kirinyaga', stage: 'growing', agent: agent4.id },
      { name: 'Plateau H', crop: 'Groundnut', date: '2025-12-01', area: 9.1, location: 'Block H, Meru', stage: 'ready', agent: agent4.id },
    ];

    for (const f of fields) {
      await client.query(
        `INSERT INTO fields (name, crop_type, planting_date, area_hectares, location, stage, assigned_agent_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [f.name, f.crop, f.date, f.area, f.location, f.stage, f.agent, admin.id]
      );
    }

    // Add some field updates/observations
    const updates = [
      { field_id: 1, agent_id: agent1.id, prev: 'growing', new: 'ready', notes: 'Crop looks excellent. Kernels well-formed, moisture level optimal for harvest.' },
      { field_id: 1, agent_id: agent1.id, prev: 'planted', new: 'growing', notes: 'Good germination rate observed. Approximately 85% coverage.' },
      { field_id: 3, agent_id: agent2.id, prev: 'ready', new: 'harvested', notes: 'Harvest completed. Yield was above average for the season.' },
      { field_id: 5, agent_id: agent3.id, prev: 'planted', new: 'growing', notes: 'Tubers sprouting well. Some minor pest activity noted on eastern edge — monitoring.' },
      { field_id: 7, agent_id: agent4.id, prev: 'planted', new: 'growing', notes: 'Flood irrigation applied. Tillering stage looking healthy.' },
      { field_id: 8, agent_id: agent4.id, prev: 'growing', new: 'ready', notes: 'Pods well-filled. Ready for harvest within 2 weeks.' },
    ];

    for (const u of updates) {
      await client.query(
        `INSERT INTO field_updates (field_id, agent_id, previous_stage, new_stage, notes) VALUES ($1, $2, $3, $4, $5)`,
        [u.field_id, u.agent_id, u.prev, u.new, u.notes]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seed completed successfully');
    console.log('\n Demo Credentials:');
    console.log('  Admin:   admin@smartseason.com / admin123');
    console.log('  Agent 1: james@smartseason.com / agent123');
    console.log('  Agent 2: amina@smartseason.com / agent123');
    console.log('  Agent 3: kwame@smartseason.com / agent123');
    console.log('  Agent 4: ngangi@smartseason.com / agent123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch(console.error);
