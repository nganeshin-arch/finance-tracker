import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      tracking_cycle_id INTEGER REFERENCES tracking_cycles(id),
      date DATE NOT NULL,
      transaction_type_id INTEGER NOT NULL REFERENCES transaction_types(id),
      category_id INTEGER NOT NULL REFERENCES categories(id),
      sub_category_id INTEGER NOT NULL REFERENCES sub_categories(id),
      payment_mode_id INTEGER NOT NULL REFERENCES payment_modes(id),
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Created transactions table');
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query('DROP TABLE IF EXISTS transactions CASCADE;');
  console.log('Dropped transactions table');
};
