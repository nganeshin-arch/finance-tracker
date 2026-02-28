import pool from '../config/database';

/**
 * Verification script for user_id migration
 * 
 * Verifies that:
 * 1. user_id column exists in transactions table
 * 2. Foreign key constraint is active
 * 3. Indexes are created
 * 4. All transactions have valid user_id (if any exist)
 */

async function verifyMigration() {
  console.log('\n🔍 Verifying user_id migration...\n');
  
  try {
    // Check 1: Verify user_id column exists
    console.log('Check 1: Verifying user_id column exists...');
    const columnCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'transactions' AND column_name = 'user_id'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('  ❌ user_id column does NOT exist');
      return false;
    }
    
    const column = columnCheck.rows[0];
    console.log(`  ✓ user_id column exists`);
    console.log(`    - Type: ${column.data_type}`);
    console.log(`    - Nullable: ${column.is_nullable}`);
    
    // Check 2: Verify foreign key constraint
    console.log('\nCheck 2: Verifying foreign key constraint...');
    const fkCheck = await pool.query(`
      SELECT constraint_name, table_name, column_name
      FROM information_schema.key_column_usage
      WHERE table_name = 'transactions' 
        AND column_name = 'user_id'
        AND constraint_name LIKE 'fk_%'
    `);
    
    if (fkCheck.rows.length === 0) {
      console.log('  ❌ Foreign key constraint does NOT exist');
      return false;
    }
    
    console.log(`  ✓ Foreign key constraint exists: ${fkCheck.rows[0].constraint_name}`);
    
    // Check 3: Verify indexes
    console.log('\nCheck 3: Verifying indexes...');
    const indexCheck = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'transactions' 
        AND indexname LIKE '%user%'
    `);
    
    if (indexCheck.rows.length === 0) {
      console.log('  ❌ No indexes found on user_id');
      return false;
    }
    
    console.log(`  ✓ Found ${indexCheck.rows.length} index(es):`);
    indexCheck.rows.forEach(row => {
      console.log(`    - ${row.indexname}`);
    });
    
    // Check 4: Verify transaction count
    console.log('\nCheck 4: Checking transaction data...');
    const transactionCount = await pool.query(`
      SELECT COUNT(*) as count FROM transactions
    `);
    
    const count = parseInt(transactionCount.rows[0].count);
    console.log(`  ℹ️  Total transactions: ${count}`);
    
    if (count > 0) {
      // Check if all transactions have valid user_id
      const invalidCount = await pool.query(`
        SELECT COUNT(*) as count 
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE u.id IS NULL
      `);
      
      const invalid = parseInt(invalidCount.rows[0].count);
      if (invalid > 0) {
        console.log(`  ❌ Found ${invalid} transactions with invalid user_id`);
        return false;
      }
      
      console.log('  ✓ All transactions have valid user_id');
    } else {
      console.log('  ✓ No transactions exist (clean slate)');
    }
    
    // Check 5: Verify users table
    console.log('\nCheck 5: Verifying users table...');
    const userCount = await pool.query(`
      SELECT COUNT(*) as count FROM users
    `);
    
    const users = parseInt(userCount.rows[0].count);
    console.log(`  ℹ️  Total users: ${users}`);
    
    if (users === 0) {
      console.log('  ⚠️  Warning: No users exist. Create users before adding transactions.');
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration verification PASSED');
    console.log('='.repeat(60));
    console.log('\nThe database is ready for multi-tenant data isolation!');
    console.log('\nNext steps:');
    console.log('  1. Users can register/login');
    console.log('  2. Each user creates their own transactions');
    console.log('  3. Users will only see their own data\n');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    return false;
  }
}

// Run verification
verifyMigration()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Verification error:', error);
    process.exit(1);
  });
