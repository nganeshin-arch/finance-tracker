import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE accounts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Created accounts table');
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query('DROP TABLE IF EXISTS accounts CASCADE;');
  console.log('Dropped accounts table');
};
