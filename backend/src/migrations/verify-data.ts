import pool from '../config/database';

async function verifyData() {
  try {
    console.log('========================================');
    console.log('Database Data Verification');
    console.log('========================================\n');

    // Check transaction types
    console.log('📋 Transaction Types:');
    const types = await pool.query('SELECT * FROM transaction_types ORDER BY id');
    types.rows.forEach(row => {
      console.log(`  ${row.id}. ${row.name}`);
    });
    console.log(`  Total: ${types.rows.length}\n`);

    // Check categories by type
    console.log('📂 Categories:');
    for (const type of types.rows) {
      const categories = await pool.query(
        'SELECT * FROM categories WHERE transaction_type_id = $1 ORDER BY name',
        [type.id]
      );
      console.log(`\n  ${type.name} Categories (${categories.rows.length}):`);
      
      for (const category of categories.rows) {
        console.log(`    ${category.id}. ${category.name}`);
        
        // Get sub-categories for this category
        const subCategories = await pool.query(
          'SELECT * FROM sub_categories WHERE category_id = $1 ORDER BY name',
          [category.id]
        );
        
        if (subCategories.rows.length > 0) {
          subCategories.rows.forEach(sub => {
            console.log(`       └─ ${sub.id}. ${sub.name}`);
          });
        }
      }
    }

    // Check payment modes
    console.log('\n\n💳 Payment Modes:');
    const modes = await pool.query('SELECT * FROM payment_modes ORDER BY id');
    modes.rows.forEach(row => {
      console.log(`  ${row.id}. ${row.name}`);
    });
    console.log(`  Total: ${modes.rows.length}\n`);

    // Check accounts
    console.log('🏦 Accounts:');
    const accounts = await pool.query('SELECT * FROM accounts ORDER BY id');
    accounts.rows.forEach(row => {
      console.log(`  ${row.id}. ${row.name}`);
    });
    console.log(`  Total: ${accounts.rows.length}\n`);

    // Summary
    const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
    const subCategoryCount = await pool.query('SELECT COUNT(*) FROM sub_categories');
    
    console.log('========================================');
    console.log('Summary:');
    console.log('========================================');
    console.log(`Transaction Types: ${types.rows.length}`);
    console.log(`Categories: ${categoryCount.rows[0].count}`);
    console.log(`Sub-Categories: ${subCategoryCount.rows[0].count}`);
    console.log(`Payment Modes: ${modes.rows.length}`);
    console.log(`Accounts: ${accounts.rows.length}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verifyData();
