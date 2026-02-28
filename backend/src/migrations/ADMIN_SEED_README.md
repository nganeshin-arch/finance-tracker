# Admin User Seed Script

This document explains how to create an initial admin user for the Personal Finance Management Application.

## Overview

The `seed-admin.ts` script creates an initial administrator account with elevated privileges to manage system configuration and categories.

## Default Credentials

**Email:** `admin@financetracker.com`  
**Password:** `Admin@123456`  
**Username:** `Admin`

⚠️ **IMPORTANT:** These are default credentials for development only. Change them immediately after first login in production!

## Usage

### Method 1: Using npm script (Recommended)

```bash
cd backend
npm run seed:admin
```

### Method 2: Using ts-node directly

```bash
cd backend
npx ts-node src/migrations/seed-admin.ts
```

## Custom Credentials

You can customize the admin credentials using environment variables:

### Option 1: Set environment variables before running

**Windows (CMD):**
```cmd
set ADMIN_EMAIL=your-admin@example.com
set ADMIN_PASSWORD=YourSecurePassword123!
set ADMIN_USERNAME=YourName
npm run seed:admin
```

**Windows (PowerShell):**
```powershell
$env:ADMIN_EMAIL="your-admin@example.com"
$env:ADMIN_PASSWORD="YourSecurePassword123!"
$env:ADMIN_USERNAME="YourName"
npm run seed:admin
```

**Linux/Mac:**
```bash
export ADMIN_EMAIL=your-admin@example.com
export ADMIN_PASSWORD=YourSecurePassword123!
export ADMIN_USERNAME=YourName
npm run seed:admin
```

### Option 2: Add to .env file

Add these variables to your `backend/.env` file:

```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_USERNAME=YourName
```

Then run:
```bash
npm run seed:admin
```

## Security Best Practices

1. **Change Default Password:** Always change the default password after first login
2. **Strong Passwords:** Use passwords with at least 8 characters, including uppercase, lowercase, numbers, and special characters
3. **Environment Variables:** In production, always use environment variables for credentials
4. **Never Commit Credentials:** Do not commit passwords or sensitive data to version control
5. **Secure Storage:** Store production credentials in a secure password manager or secrets management system

## Script Behavior

- **Idempotent:** The script checks if an admin user already exists before creating one
- **Safe to Re-run:** If an admin user with the specified email already exists, the script will skip creation and exit gracefully
- **Password Hashing:** Passwords are hashed using bcrypt with configurable salt rounds (default: 10)
- **Database Connection:** Uses the same database configuration as the main application

## Troubleshooting

### Error: "Admin user already exists"

This is not an error - it means an admin user with the specified email already exists in the database. The script will exit without making changes.

### Error: "JWT_SECRET environment variable is not configured"

Make sure your `backend/.env` file contains a `JWT_SECRET` value:
```env
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

### Error: "Database connection failed"

Verify that:
1. PostgreSQL is running
2. Database credentials in `.env` are correct
3. The `finance_tracker` database exists
4. The `users` table has been created (run migrations first)

### Error: "bcrypt not found"

Install dependencies:
```bash
cd backend
npm install
```

## First Login

After creating the admin user:

1. Start the application:
   ```bash
   npm run dev
   ```

2. Navigate to the login page in your browser

3. Enter the admin credentials:
   - Email: `admin@financetracker.com` (or your custom email)
   - Password: `Admin@123456` (or your custom password)

4. **Immediately change your password** after logging in

## Admin Capabilities

Admin users have access to:
- All regular user features (transactions, dashboard, etc.)
- Admin panel for system configuration
- Category management (create, edit, delete categories)
- Sub-category management
- Payment mode management
- Account management
- Transaction type management
- User management (future feature)

## Production Deployment

For production environments:

1. **Never use default credentials**
2. Set strong, unique credentials via environment variables
3. Use a secrets management service (AWS Secrets Manager, Azure Key Vault, etc.)
4. Enable HTTPS for all communications
5. Implement additional security measures (2FA, IP whitelisting, etc.)
6. Regularly rotate admin passwords
7. Monitor admin account activity

## Related Files

- `seed-admin.ts` - The admin seed script
- `009_create_users.ts` - Users table migration
- `../services/authService.ts` - Authentication service with password hashing
- `../controllers/authController.ts` - Authentication endpoints
- `../middleware/authMiddleware.ts` - Role-based authorization

## Support

If you encounter issues:
1. Check the console output for detailed error messages
2. Verify database connection and migrations
3. Ensure all environment variables are set correctly
4. Review the application logs
