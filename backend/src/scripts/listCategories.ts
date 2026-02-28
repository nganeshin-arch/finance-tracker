import pool from '../config/database';

async function listCategories() {
  try {
    console.log('\n=== Income Categories ===\n');
    
    const incomeResult = await pool.query(`
      SELECT c.id, c.name, tt.name as type
      FROM categories c
      JOIN transaction_types tt ON c.transaction_type_id = tt.id
      WHERE tt.name = 'Income'
      ORDER BY c.name ASC
    `);
    
    incomeResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (ID: ${row.id})`);
    });
    
    console.log(`\nTotal Income Categories: ${incomeResult.rows.length}\n`);
    
    console.log('\n=== Expense Categories ===\n');
    
    const expenseResult = await pool.query(`
      SELECT c.id, c.name, tt.name as type
      FROM categories c
      JOIN transaction_types tt ON c.transaction_type_id = tt.id
      WHERE tt.name = 'Expense'
      ORDER BY c.name ASC
    `);
    
    expenseResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (ID: ${row.id})`);
    });
    
    console.log(`\nTotal Expense Categories: ${expenseResult.rows.length}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing categories:', error);
    process.exit(1);
  }
}

listCategories();
