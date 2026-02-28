import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Create index on email for faster lookups
  await pool.query(`
    CREATE INDEX idx_users_email ON users(email);
  `);
  
  console.log('Created users table with email index');
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query('DROP INDEX IF EXISTS idx_users_email;');
  await pool.query('DROP TABLE IF EXISTS users CASCADE;');
  console.log('Dropped users table and email index');
};
