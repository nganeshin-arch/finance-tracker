import pool from '../config/database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Seed script to create an initial admin user
 * 
 * Default credentials:
 * Email: admin@financetracker.com
 * Password: Admin@123456
 * 
 * IMPORTANT: Change the admin password immediately after first login in production!
 */
async function seedAdminUser() {
  try {
    console.log('Starting admin user seeding...\n');

    // Admin user credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@financetracker.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminUsername = process.env.ADMIN_USERNAME || 'Admin';

    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists with email:', adminEmail);
      console.log('   User ID:', existingUser.rows[0].id);
      console.log('\nSkipping admin user creation.');
      process.exit(0);
    }

    // Hash the admin password
    console.log('▶️  Hashing admin password...');
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    console.log('✅ Password hashed successfully\n');

    // Insert admin user into database
    console.log('▶️  Creating admin user...');
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, username, email, role, created_at`,
      [adminUsername, adminEmail, passwordHash, 'admin']
    );

    const adminUser = result.rows[0];
    console.log('✅ Admin user created successfully!\n');

    // Display admin credentials
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                   ADMIN USER CREATED                      ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('User ID:     ', adminUser.id);
    console.log('Username:    ', adminUser.username);
    console.log('Email:       ', adminUser.email);
    console.log('Role:        ', adminUser.role);
    console.log('Created At:  ', adminUser.created_at);
    console.log('───────────────────────────────────────────────────────────');
    console.log('LOGIN CREDENTIALS:');
    console.log('───────────────────────────────────────────────────────────');
    console.log('Email:       ', adminEmail);
    console.log('Password:    ', adminPassword);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT SECURITY NOTICE:');
    console.log('   1. Save these credentials in a secure location');
    console.log('   2. Change the admin password immediately after first login');
    console.log('   3. Do NOT commit these credentials to version control');
    console.log('   4. In production, use environment variables for credentials\n');

    console.log('Admin user seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin user seeding failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

seedAdminUser();
