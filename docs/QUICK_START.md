# Quick Start Guide

Get the Personal Finance Tracker running on your local machine in under 10 minutes.

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18+ installed ([Download](https://nodejs.org/))
- ✅ PostgreSQL 14+ installed ([Download](https://www.postgresql.org/download/))
- ✅ Git installed ([Download](https://git-scm.com/))
- ✅ A code editor (VS Code recommended)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd personal-finance-tracker
```

## Step 2: Setup Database

### Option A: Using psql (Recommended)

```bash
# Start PostgreSQL (if not running)
# macOS: brew services start postgresql@14
# Ubuntu: sudo systemctl start postgresql
# Windows: Start from Services

# Create database
psql -U postgres
```

In psql:
```sql
CREATE DATABASE finance_tracker;
\q
```

### Option B: Using GUI Tool

Use pgAdmin, DBeaver, or any PostgreSQL GUI tool to create a database named `finance_tracker`.

## Step 3: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your database credentials
# Default values should work if you're using postgres user
```

Your `.env` should look like:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_tracker
DB_USER=postgres
DB_PASSWORD=your_password
FRONTEND_URL=http://localhost:3000
```

```bash
# Run migrations and seed data
npm run migrate

# Start backend server
npm run dev
```

✅ Backend should now be running at http://localhost:5000

## Step 4: Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# No need to edit - default values work for local development
```

```bash
# Start frontend server
npm run dev
```

✅ Frontend should now be running at http://localhost:3000

## Step 5: Verify Installation

### Test Backend

Open http://localhost:5000/health in your browser.

You should see:
```json
{
  "status": "ok",
  "message": "Personal Finance Tracker API is running",
  "database": "connected"
}
```

### Test Frontend

Open http://localhost:3000 in your browser.

You should see the Personal Finance Tracker dashboard.

## Step 6: Explore the Application

### 1. View Dashboard

- Navigate to the Dashboard page
- You'll see summary cards (currently empty)
- Charts will populate once you add transactions

### 2. Create a Transaction

- Go to Transactions page
- Click "Add Transaction" button
- Fill in the form:
  - Date: Today's date
  - Type: Expense
  - Category: Food & Dining
  - Sub-Category: Groceries
  - Payment Mode: Cash
  - Account: Main Account
  - Amount: 50.00
  - Description: Weekly groceries
- Click "Save"

### 3. View Updated Dashboard

- Go back to Dashboard
- You should now see:
  - Total Expenses: $50.00
  - Expense by Category chart
  - Monthly trend chart

### 4. Explore Admin Panel

- Go to Admin page
- Try adding a new category
- Try adding a new payment mode
- Explore the configuration options

## Common Issues

### Issue: "Database connection failed"

**Solution**:
```bash
# Check PostgreSQL is running
# macOS: brew services list
# Ubuntu: sudo systemctl status postgresql
# Windows: Check Services

# Verify credentials in backend/.env
# Try connecting manually
psql -U postgres -d finance_tracker
```

### Issue: "Port 5000 already in use"

**Solution**:
```bash
# Find and kill the process
# macOS/Linux: lsof -ti:5000 | xargs kill -9
# Windows: netstat -ano | findstr :5000
#          taskkill /PID <PID> /F

# Or change PORT in backend/.env to 5001
```

### Issue: "Port 3000 already in use"

**Solution**:
```bash
# Vite will automatically suggest port 3001
# Or kill the process using port 3000
```

### Issue: "npm install fails"

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: "Migration fails"

**Solution**:
```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE finance_tracker;
CREATE DATABASE finance_tracker;
\q

# Run migrations again
cd backend
npm run migrate
```

## Next Steps

### Learn the Codebase

1. **Backend Structure**:
   - `src/controllers/` - Request handlers
   - `src/services/` - Business logic
   - `src/repositories/` - Database access
   - `src/routes/` - API routes

2. **Frontend Structure**:
   - `src/pages/` - Page components
   - `src/components/` - Reusable components
   - `src/services/` - API calls
   - `src/contexts/` - State management

### Read Documentation

- [API Documentation](API.md) - Complete API reference
- [Deployment Guide](DEPLOYMENT.md) - Deploy to production
- [Contributing Guide](../CONTRIBUTING.md) - Contribute to the project
- [Testing Checklist](TESTING_CHECKLIST.md) - Test the application

### Try These Tasks

1. **Add a new transaction type**:
   - Go to Admin → Transaction Types
   - Add "Transfer" type
   - Create categories for transfers

2. **Create a monthly tracking cycle**:
   - Go to Transactions page
   - Use the Tracking Cycle Manager
   - Create a cycle for current month

3. **Filter transactions**:
   - Go to Transactions page
   - Use date range filter
   - Try different date ranges

4. **Customize the theme**:
   - Edit `frontend/src/theme/theme.ts`
   - Change primary color
   - See changes in real-time

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload. Changes will reflect automatically.

2. **Database Changes**: After modifying database schema, you'll need to:
   ```bash
   # Drop database
   psql -U postgres -c "DROP DATABASE finance_tracker;"
   psql -U postgres -c "CREATE DATABASE finance_tracker;"
   
   # Run migrations
   cd backend
   npm run migrate
   ```

3. **API Testing**: Use curl or Postman to test API endpoints:
   ```bash
   curl http://localhost:5000/api/transactions
   ```

4. **Browser DevTools**: Use React DevTools and Network tab for debugging.

5. **Console Logs**: Check terminal output for backend logs and browser console for frontend logs.

## Useful Commands

### Backend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run migrations
npm run migrate

# Seed database
npm run seed
```

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database

```bash
# Connect to database
psql -U postgres -d finance_tracker

# List tables
\dt

# Describe table
\d transactions

# Run SQL query
SELECT * FROM transactions;

# Exit
\q
```

## Getting Help

- 📖 Check the [documentation](.)
- 🐛 [Report a bug](https://github.com/your-repo/issues)
- 💡 [Request a feature](https://github.com/your-repo/issues)
- 💬 [Ask a question](https://github.com/your-repo/discussions)

## What's Next?

Now that you have the application running:

1. ✅ Explore all features
2. ✅ Read the documentation
3. ✅ Try making changes
4. ✅ Consider contributing

Happy coding! 🚀
