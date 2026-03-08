import pool from '../config/database';

/**
 * Migration: Create user_preferences table
 * Stores user-specific settings like custom monthly date ranges
 */
export async function up(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create user_preferences table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        monthly_start_date INTEGER NOT NULL DEFAULT 1 CHECK (monthly_start_date >= 1 AND monthly_start_date <= 31),
        timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);
    
    // Create index on user_id for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
      ON user_preferences(user_id)
    `);
    
    // Add trigger to update updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    
    await client.query(`
      CREATE TRIGGER update_user_preferences_updated_at
        BEFORE UPDATE ON user_preferences
        FOR EACH ROW
        EXECUTE FUNCTION update_user_preferences_updated_at()
    `);
    
    await client.query('COMMIT');
    console.log('✅ Migration 011: user_preferences table created successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration 011 failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Rollback migration
 */
export async function down(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Drop trigger and function
    await client.query('DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences');
    await client.query('DROP FUNCTION IF EXISTS update_user_preferences_updated_at()');
    
    // Drop table
    await client.query('DROP TABLE IF EXISTS user_preferences');
    
    await client.query('COMMIT');
    console.log('✅ Migration 011 rollback completed');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration 011 rollback failed:', error);
    throw error;
  } finally {
    client.release();
  }
}