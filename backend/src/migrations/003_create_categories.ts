import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      transaction_type_id INTEGER NOT NULL REFERENCES transaction_types(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, transaction_type_id)
    );
  `);
  console.log('Created categories table');
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query('DROP TABLE IF EXISTS categories CASCADE;');
  console.log('Dropped categories table');
};
