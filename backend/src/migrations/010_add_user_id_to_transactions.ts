import pool from '../config/database';

/**
 * Migration: Add user_id column to transactions table
 * 
 * This migration implements multi-tenant data isolation by:
 * 1. Adding user_id column to transactions table
 * 2. Creating foreign key constraint to users table
 * 3. Creating index for query performance
 * 4. Deleting existing transactions (as per user request)
 * 
 * Requirements: 4.1, 4.4, 4.5
 */

export async function up(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Starting migration: Add user_id to transactions...');
    
    // Step 1: Delete all existing transactions (as per user request)
    console.log('Step 1: Deleting existing transactions...');
    const deleteResult = await client.query('DELETE FROM transactions');
    console.log(`  ✓ Deleted ${deleteResult.rowCount} existing transactions`);
    
    // Step 2: Add user_id column (NOT NULL since we deleted all data)
    console.log('Step 2: Adding user_id column...');
    await client.query(`
      ALTER TABLE transactions 
      ADD COLUMN user_id INTEGER NOT NULL
    `);
    console.log('  ✓ Added user_id column');
    
    // Step 3: Add foreign key constraint
    console.log('Step 3: Adding foreign key constraint...');
    await client.query(`
      ALTER TABLE transactions
      ADD CONSTRAINT fk_transactions_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
    `);
    console.log('  ✓ Added foreign key constraint');
    
    // Step 4: Create index for performance
    console.log('Step 4: Creating index on user_id...');
    await client.query(`
      CREATE INDEX idx_transactions_user_id 
      ON transactions(user_id)
    `);
    console.log('  ✓ Created index idx_transactions_user_id');
    
    // Step 5: Create composite index for common queries
    console.log('Step 5: Creating composite index...');
    await client.query(`
      CREATE INDEX idx_transactions_user_date 
      ON transactions(user_id, date DESC)
    `);
    console.log('  ✓ Created index idx_transactions_user_date');
    
    await client.query('COMMIT');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Restart the backend server');
    console.log('  2. Users can now create transactions');
    console.log('  3. Each user will only see their own data\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function down(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Rolling back migration: Remove user_id from transactions...');
    
    // Step 1: Drop indexes
    console.log('Step 1: Dropping indexes...');
    await client.query('DROP INDEX IF EXISTS idx_transactions_user_date');
    await client.query('DROP INDEX IF EXISTS idx_transactions_user_id');
    console.log('  ✓ Dropped indexes');
    
    // Step 2: Drop foreign key constraint
    console.log('Step 2: Dropping foreign key constraint...');
    await client.query(`
      ALTER TABLE transactions
      DROP CONSTRAINT IF EXISTS fk_transactions_user
    `);
    console.log('  ✓ Dropped foreign key constraint');
    
    // Step 3: Drop user_id column
    console.log('Step 3: Dropping user_id column...');
    await client.query(`
      ALTER TABLE transactions
      DROP COLUMN IF EXISTS user_id
    `);
    console.log('  ✓ Dropped user_id column');
    
    await client.query('COMMIT');
    
    console.log('\n✅ Rollback completed successfully!\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Rollback failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if executed directly
if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
