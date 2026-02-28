import pool from '../config/database';

async function listTransactionTypes() {
  try {
    console.log('\n=== Transaction Types ===\n');
    
    const result = await pool.query(`
      SELECT id, name, created_at
      FROM transaction_types
      ORDER BY id ASC
    `);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No transaction types found in database!');
      console.log('\nRun the seed script to add transaction types:');
      console.log('  npm run seed\n');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name} (ID: ${row.id})`);
      });
      console.log(`\nTotal Transaction Types: ${result.rows.length}\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing transaction types:', error);
    process.exit(1);
  }
}

listTransactionTypes();
