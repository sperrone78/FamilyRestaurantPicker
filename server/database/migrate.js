const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const pool = new Pool({
  connectionString: process.env.NODE_ENV === 'test' 
    ? process.env.DATABASE_URL_TEST 
    : process.env.DATABASE_URL,
  ssl: false,
});

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    // Get applied migrations
    const appliedResult = await pool.query('SELECT version FROM schema_migrations');
    const appliedMigrations = appliedResult.rows.map(row => row.version);
    
    // Run pending migrations
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');
      
      if (!appliedMigrations.includes(version)) {
        console.log(`Running migration: ${file}`);
        
        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        await pool.query('BEGIN');
        try {
          await pool.query(migrationSQL);
          await pool.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
          await pool.query('COMMIT');
          console.log(`Migration ${file} completed successfully`);
        } catch (error) {
          await pool.query('ROLLBACK');
          throw error;
        }
      } else {
        console.log(`Migration ${file} already applied`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();