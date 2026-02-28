import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE sub_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, category_id)
    );
  `);
  console.log('Created sub_categories table');
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query('DROP TABLE IF EXISTS sub_categories CASCADE;');
  console.log('Dropped sub_categories table');
};
