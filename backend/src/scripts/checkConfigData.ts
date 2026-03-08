import pool from '../config/database';

async function checkConfigData() {
  try {
    console.log('========================================');
    console.log('Checking Configuration Data');
    console.log('========================================\n');

    // Check transaction types
    console.log('📊 Transaction Types:');
    const typesResult = await pool.query('SELECT * FROM transaction_types ORDER BY id');
    console.log(`Found ${typesResult.rows.length} transaction types:`);
    typesResult.rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Name: ${row.name}`);
    });
    console.log('');

    // Check categories
    console.log('📁 Categories:');
    const categoriesResult = await pool.query(`
      SELECT c.*, tt.name as transaction_type_name 
      FROM categories c
      JOIN transaction_types tt ON c.transaction_type_id = tt.id
      ORDER BY tt.name, c.name
    `);
    console.log(`Found ${categoriesResult.rows.length} categories:`);
    
    const groupedCategories: Record<string, any[]> = {};
    categoriesResult.rows.forEach(row => {
      if (!groupedCategories[row.transaction_type_name]) {
        groupedCategories[row.transaction_type_name] = [];
      }
      groupedCategories[row.transaction_type_name].push(row);
    });
    
    Object.entries(groupedCategories).forEach(([typeName, categories]) => {
      console.log(`  ${typeName} (${categories.length} categories):`);
      categories.forEach(cat => {
        console.log(`    - ID: ${cat.id}, Name: ${cat.name}`);
      });
    });
    console.log('');

    // Check sub-categories
    console.log('📂 Sub-Categories:');
    const subCategoriesResult = await pool.query(`
      SELECT sc.*, c.name as category_name 
      FROM sub_categories sc
      JOIN categories c ON sc.category_id = c.id
      ORDER BY c.name, sc.name
    `);
    console.log(`Found ${subCategoriesResult.rows.length} sub-categories:`);
    
    const groupedSubCategories: Record<string, any[]> = {};
    subCategoriesResult.rows.forEach(row => {
      if (!groupedSubCategories[row.category_name]) {
        groupedSubCategories[row.category_name] = [];
      }
      groupedSubCategories[row.category_name].push(row);
    });
    
    Object.entries(groupedSubCategories).forEach(([catName, subCats]) => {
      console.log(`  ${catName} (${subCats.length} sub-categories):`);
      subCats.forEach(subCat => {
        console.log(`    - ID: ${subCat.id}, Name: ${subCat.name}`);
      });
    });
    console.log('');

    // Check payment modes
    console.log('💳 Payment Modes:');
    const modesResult = await pool.query('SELECT * FROM payment_modes ORDER BY id');
    console.log(`Found ${modesResult.rows.length} payment modes:`);
    modesResult.rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Name: ${row.name}`);
    });
    console.log('');

    // Check accounts
    console.log('🏦 Accounts:');
    const accountsResult = await pool.query('SELECT * FROM accounts ORDER BY id');
    console.log(`Found ${accountsResult.rows.length} accounts:`);
    accountsResult.rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Name: ${row.name}`);
    });
    console.log('');

    console.log('========================================');
    console.log('Summary:');
    console.log('========================================');
    console.log(`Transaction Types: ${typesResult.rows.length}`);
    console.log(`Categories: ${categoriesResult.rows.length}`);
    console.log(`Sub-Categories: ${subCategoriesResult.rows.length}`);
    console.log(`Payment Modes: ${modesResult.rows.length}`);
    console.log(`Accounts: ${accountsResult.rows.length}`);
    console.log('');

    if (typesResult.rows.length === 0) {
      console.log('⚠️  WARNING: No data found! Run: npm run seed');
    } else {
      console.log('✅ Data exists in database!');
      console.log('');
      console.log('If admin panel shows "No items found", the issue is likely:');
      console.log('1. Frontend not calling the correct API endpoint');
      console.log('2. API response not being parsed correctly');
      console.log('3. Browser cache showing old data');
      console.log('');
      console.log('Try:');
      console.log('- Hard refresh browser (Ctrl+Shift+R)');
      console.log('- Check browser console for errors');
      console.log('- Check Network tab for API responses');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking data:', error);
    process.exit(1);
  }
}

checkConfigData();
