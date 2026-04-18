const pool = require('./db');

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'agent')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Fields table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fields (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        crop_type VARCHAR(100) NOT NULL,
        planting_date DATE NOT NULL,
        area_hectares DECIMAL(10, 2),
        location VARCHAR(255),
        stage VARCHAR(20) NOT NULL DEFAULT 'planted'
          CHECK (stage IN ('planted', 'growing', 'ready', 'harvested')),
        assigned_agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Field updates / observations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS field_updates (
        id SERIAL PRIMARY KEY,
        field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
        agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        previous_stage VARCHAR(20),
        new_stage VARCHAR(20) NOT NULL
          CHECK (new_stage IN ('planted', 'growing', 'ready', 'harvested')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate().catch(console.error);
