import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE transaction_types (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Created transaction_types table');
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query('DROP TABLE IF EXISTS transaction_types CASCADE;');
  console.log('Dropped transaction_types table');
};
