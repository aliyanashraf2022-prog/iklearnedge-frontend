const { Pool } = require('pg');

const passwords = [
  'Sociologist@522./',
  'Sociologist@522.',
  'sociologist@522./',
  'sociologist@522.'
];

const config = {
  host: 'db.gloqveyprtflmulzjwau.supabase.co',
  port: 5432,
  user: 'postgres',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function tryConnect(password) {
  const pool = new Pool({ ...config, password });
  try {
    const client = await pool.connect();
    console.log(`✓ Connected with password: ${password}`);
    await client.query('SELECT 1');
    client.release();
    await pool.end();
    return true;
  } catch (err) {
    await pool.end();
    return false;
  }
}

async function runMigrations() {
  for (const pwd of passwords) {
    console.log(`Trying password: ${pwd}...`);
    const connected = await tryConnect(pwd);
    if (connected) {
      console.log(`\nSuccessfully connected with: ${pwd}`);
      
      const pool = new Pool({ ...config, password: pwd });
      const client = await pool.connect();
      
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS site_settings (
            id SERIAL PRIMARY KEY,
            setting_key VARCHAR(100) UNIQUE NOT NULL,
            setting_value TEXT,
            setting_type VARCHAR(20) DEFAULT 'string',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✓ Created site_settings table');
        
        await client.query(`
          INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES
            ('primary_color', '#f5a623', 'color'),
            ('secondary_color', '#4a4a4a', 'color'),
            ('accent_color', '#3498db', 'color'),
            ('currency', 'AED', 'string'),
            ('currency_symbol', 'د.إ', 'string'),
            ('site_name', 'IkLearnEdge', 'string')
          ON CONFLICT (setting_key) DO NOTHING
        `);
        console.log('✓ Inserted default settings');
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS top_verified_teachers (
            id SERIAL PRIMARY KEY,
            teacher_id INTEGER NOT NULL,
            position INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(teacher_id)
          )
        `);
        console.log('✓ Created top_verified_teachers table');
        
        console.log('\n✓ All migrations completed!');
        break;
      } finally {
        client.release();
        await pool.end();
      }
    }
  }
}

runMigrations().catch(console.error);