import pool from '../config/database';
import * as migration009 from './009_create_users';

async function testRollback() {
  try {
    console.log('Testing migration rollback functionality...\n');
    
    // Check if users table exists before rollback
    const beforeCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!beforeCheck.rows[0].exists) {
      console.log('❌ Users table does not exist. Cannot test rollback.');
      process.exit(1);
    }
    
    console.log('✅ Users table exists before rollback');
    
    // Execute rollback (down migration)
    console.log('\n▶️  Executing rollback (down migration)...');
    await migration009.down(pool);
    console.log('✅ Rollback executed successfully');
    
    // Check if users table was dropped
    const afterCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (afterCheck.rows[0].exists) {
      console.log('❌ Users table still exists after rollback!');
      process.exit(1);
    }
    
    console.log('✅ Users table successfully dropped');
    
    // Check if email index was dropped
    const indexCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes
        WHERE tablename = 'users' 
        AND indexname = 'idx_users_email'
        AND schemaname = 'public'
      );
    `);
    
    if (indexCheck.rows[0].exists) {
      console.log('❌ Email index still exists after rollback!');
      process.exit(1);
    }
    
    console.log('✅ Email index successfully dropped');
    
    // Re-run the migration (up)
    console.log('\n▶️  Re-running migration (up)...');
    await migration009.up(pool);
    console.log('✅ Migration re-executed successfully');
    
    // Verify table was recreated
    const finalCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!finalCheck.rows[0].exists) {
      console.log('❌ Users table was not recreated!');
      process.exit(1);
    }
    
    console.log('✅ Users table successfully recreated');
    
    // Re-record the migration
    await pool.query('INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', ['009_create_users']);
    
    console.log('\n✅ Rollback test completed successfully!');
    console.log('   - Table dropped correctly');
    console.log('   - Index dropped correctly');
    console.log('   - Table recreated correctly');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Rollback test failed:', error);
    process.exit(1);
  }
}

testRollback();
