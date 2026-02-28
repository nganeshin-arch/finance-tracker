import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  // Indexes for transactions table
  await pool.query(`
    CREATE INDEX idx_transactions_tracking_cycle ON transactions(tracking_cycle_id);
  `);
  await pool.query(`
    CREATE INDEX idx_transactions_date ON transactions(date);
  `);
  await pool.query(`
    CREATE INDEX idx_transactions_type ON transactions(transaction_type_id);
  `);
  await pool.query(`
    CREATE INDEX idx_transactions_category ON transactions(category_id);
  `);
  
  // Indexes for categories table
  await pool.query(`
    CREATE INDEX idx_categories_type ON categories(transaction_type_id);
  `);
  
  // Indexes for sub_categories table
  await pool.query(`
    CREATE INDEX idx_subcategories_category ON sub_categories(category_id);
  `);
  
  // Indexes for tracking_cycles table
  await pool.query(`
    CREATE INDEX idx_tracking_cycles_dates ON tracking_cycles(start_date, end_date);
  `);
  await pool.query(`
    CREATE INDEX idx_tracking_cycles_active ON tracking_cycles(is_active);
  `);
  
  console.log('Created all indexes');
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query('DROP INDEX IF EXISTS idx_transactions_tracking_cycle;');
  await pool.query('DROP INDEX IF EXISTS idx_transactions_date;');
  await pool.query('DROP INDEX IF EXISTS idx_transactions_type;');
  await pool.query('DROP INDEX IF EXISTS idx_transactions_category;');
  await pool.query('DROP INDEX IF EXISTS idx_categories_type;');
  await pool.query('DROP INDEX IF EXISTS idx_subcategories_category;');
  await pool.query('DROP INDEX IF EXISTS idx_tracking_cycles_dates;');
  await pool.query('DROP INDEX IF EXISTS idx_tracking_cycles_active;');
  console.log('Dropped all indexes');
};
