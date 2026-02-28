import pool from '../config/database';

async function verifyUsersTable() {
  try {
    console.log('Verifying users table structure...\n');
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ Users table does not exist!');
      process.exit(1);
    }
    
    console.log('✅ Users table exists');
    
    // Check table columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Table columns:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Verify required columns exist
    const columnNames = columnsResult.rows.map(row => row.column_name);
    const requiredColumns = ['id', 'username', 'email', 'password_hash', 'role', 'created_at', 'updated_at'];
    
    console.log('\n🔍 Checking required columns:');
    let allColumnsPresent = true;
    requiredColumns.forEach(col => {
      if (columnNames.includes(col)) {
        console.log(`  ✅ ${col} - present`);
      } else {
        console.log(`  ❌ ${col} - MISSING`);
        allColumnsPresent = false;
      }
    });
    
    // Check indexes
    const indexesResult = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'users' AND schemaname = 'public';
    `);
    
    console.log('\n📊 Indexes:');
    indexesResult.rows.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
      console.log(`    ${idx.indexdef}`);
    });
    
    // Verify email index exists
    const emailIndexExists = indexesResult.rows.some(idx => idx.indexname === 'idx_users_email');
    if (emailIndexExists) {
      console.log('\n✅ Email index (idx_users_email) exists');
    } else {
      console.log('\n❌ Email index (idx_users_email) is MISSING');
      allColumnsPresent = false;
    }
    
    // Check constraints
    const constraintsResult = await pool.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND table_name = 'users';
    `);
    
    console.log('\n🔒 Constraints:');
    constraintsResult.rows.forEach(con => {
      console.log(`  - ${con.constraint_name}: ${con.constraint_type}`);
    });
    
    if (allColumnsPresent) {
      console.log('\n✅ All verification checks passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some verification checks failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyUsersTable();
