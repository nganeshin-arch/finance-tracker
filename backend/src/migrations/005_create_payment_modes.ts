import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE payment_modes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Created payment_modes table');
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query('DROP TABLE IF EXISTS payment_modes CASCADE;');
  console.log('Dropped payment_modes table');
};
