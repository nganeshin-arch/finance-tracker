import pool from '../config/database';
import * as migration001 from './001_create_tracking_cycles';
import * as migration002 from './002_create_transaction_types';
import * as migration003 from './003_create_categories';
import * as migration004 from './004_create_sub_categories';
import * as migration005 from './005_create_payment_modes';
import * as migration006 from './006_create_accounts';
import * as migration007 from './007_create_transactions';
import * as migration008 from './008_create_indexes';
import * as migration009 from './009_create_users';

const migrations = [
  { name: '001_create_tracking_cycles', ...migration001 },
  { name: '002_create_transaction_types', ...migration002 },
  { name: '003_create_categories', ...migration003 },
  { name: '004_create_sub_categories', ...migration004 },
  { name: '005_create_payment_modes', ...migration005 },
  { name: '006_create_accounts', ...migration006 },
  { name: '007_create_transactions', ...migration007 },
  { name: '008_create_indexes', ...migration008 },
  { name: '009_create_users', ...migration009 },
];

async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await pool.query('SELECT name FROM migrations ORDER BY id');
  return result.rows.map(row => row.name);
}

async function recordMigration(name: string) {
  await pool.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

async function runMigrations() {
  try {
    console.log('Starting database migrations...\n');
    
    await createMigrationsTable();
    const executedMigrations = await getExecutedMigrations();
    
    for (const migration of migrations) {
      if (executedMigrations.includes(migration.name)) {
        console.log(`⏭️  Skipping ${migration.name} (already executed)`);
        continue;
      }
      
      console.log(`▶️  Running ${migration.name}...`);
      await migration.up(pool);
      await recordMigration(migration.name);
      console.log(`✅ Completed ${migration.name}\n`);
    }
    
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
