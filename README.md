# Personal Finance Tracker

A web-based application for managing personal financial transactions with an intuitive interface for tracking income, expenses, and visualizing financial performance.

## Project Structure

```
personal-finance-tracker/
├── backend/          # Express.js + TypeScript API
├── frontend/         # React + TypeScript UI
├── database/         # PostgreSQL setup scripts
├── .kiro/           # Kiro specs and documentation
└── docs/            # API documentation
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Quick Start

### Windows Users - Easy Start! 🎉

**Just double-click `start-app.bat`** to start the application!

See [BATCH_SCRIPTS_README.md](BATCH_SCRIPTS_README.md) for all available batch scripts.

### Manual Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personal-finance-tracker
```

### 2. Database Setup

**Install PostgreSQL** (if not already installed):
- **macOS**: `brew install postgresql@14`
- **Ubuntu/Debian**: `sudo apt-get install postgresql-14`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

**Create Database**:
```bash
# Start PostgreSQL service
# macOS: brew services start postgresql@14
# Ubuntu: sudo systemctl start postgresql
# Windows: Start from Services

# Create database
psql -U postgres
CREATE DATABASE finance_tracker;
\q
```

**Run Migrations**:
```bash
cd database
psql -U postgres -d finance_tracker -f setup.sql
```

Or use the backend migration scripts:
```bash
cd backend
npm install
npm run migrate
```

**Create Admin User** (for authentication features):
```bash
# Windows: Double-click seed-admin.bat
# Or manually:
cd backend
npm run seed:admin
```

Default admin credentials:
- Email: `admin@financetracker.com`
- Password: `Admin@123456`

⚠️ **Change the password immediately after first login!**

See [backend/src/migrations/ADMIN_SEED_README.md](backend/src/migrations/ADMIN_SEED_README.md) for detailed instructions.

### 3. Backend Setup

```bash
cd backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials

# Run migrations and seed data
npm run migrate

# Start development server
npm run dev
```

The backend API will run on **http://localhost:5000**

### 4. Frontend Setup

```bash
cd frontend
npm install

# Copy environment file
cp .env.example .env
# Default API URL is http://localhost:5000/api

# Start development server
npm run dev
```

The frontend will run on **http://localhost:3000**

### 5. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

**Default Setup**:
- The application starts with seeded data including transaction types, categories, and payment modes
- No authentication required in Phase 1 - all features are accessible


## Development

### Backend Commands
- `npm run dev` - Start development server with hot reload (nodemon)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm run migrate` - Run database migrations and seed data

### Frontend Commands
- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Database Commands
```bash
# Connect to database
psql -U postgres -d finance_tracker

# Run migrations manually
psql -U postgres -d finance_tracker -f database/setup.sql

# Backup database
pg_dump -U postgres finance_tracker > backup.sql

# Restore database
psql -U postgres -d finance_tracker < backup.sql
```

## Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_tracker
DB_USER=postgres
DB_PASSWORD=your_password_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
```

## Production Deployment

### Backend Deployment

**Option 1: Heroku**
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-url.com

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run npm run migrate
```

**Option 2: Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Deploy
railway up
```

**Option 3: DigitalOcean App Platform**
- Connect your GitHub repository
- Select the backend folder
- Add PostgreSQL database
- Configure environment variables
- Deploy

### Frontend Deployment

**Option 1: Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Set environment variable
vercel env add VITE_API_BASE_URL
```

**Option 2: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

**Option 3: AWS S3 + CloudFront**
```bash
# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Docker Deployment (Optional)

See `docker-compose.yml` for containerized deployment setup.

```bash
# Build and start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## API Documentation

Comprehensive API documentation is available in `docs/API.md`.

**Quick Reference**:
- Transactions: `/api/transactions`
- Tracking Cycles: `/api/tracking-cycles`
- Dashboard: `/api/dashboard`
- Configuration: `/api/config`

See full endpoint details, request/response examples, and error codes in the API documentation.

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
# macOS: brew services list
# Ubuntu: sudo systemctl status postgresql
# Windows: Check Services

# Test connection
psql -U postgres -d finance_tracker -c "SELECT 1;"

# Check credentials in backend/.env
```

### Port Already in Use
```bash
# Find process using port 5000
# macOS/Linux: lsof -i :5000
# Windows: netstat -ano | findstr :5000

# Kill process
# macOS/Linux: kill -9 <PID>
# Windows: taskkill /PID <PID> /F
```

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that backend is running before starting frontend
- Clear browser cache and restart both servers

### Migration Errors
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

## Tech Stack

### Backend
- Node.js + Express.js
- TypeScript
- PostgreSQL
- pg (PostgreSQL client)

### Frontend
- React 18
- TypeScript
- Material-UI
- React Router
- React Hook Form + Yup
- Axios
- Recharts
- date-fns

## Features

- Transaction management (create, read, update, delete)
- Monthly tracking cycles
- Category and sub-category organization
- Dashboard with financial summaries
- Expense visualization by category
- Monthly trend analysis
- Admin configuration panel

## Testing

### Manual Testing

1. **Start the application** (see Quick Start above)

2. **Test Transaction Flow**:
   - Navigate to Transactions page
   - Create a new transaction with all required fields
   - Edit the transaction
   - Delete the transaction
   - Filter transactions by date range

3. **Test Dashboard**:
   - Navigate to Dashboard
   - Verify summary cards show correct totals
   - Check expense by category chart
   - View monthly trend chart
   - Switch between tracking cycles

4. **Test Admin Panel**:
   - Navigate to Admin page
   - Add new categories and sub-categories
   - Add payment modes and accounts
   - Try to delete items (should prevent if in use)

5. **Test Tracking Cycles**:
   - Create a new tracking cycle
   - Activate/deactivate cycles
   - Verify transactions are associated with correct cycle

### API Testing

Test API endpoints using curl or Postman:

```bash
# Health check
curl http://localhost:5000/health

# Get all transactions
curl http://localhost:5000/api/transactions

# Create transaction
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "transactionTypeId": 2,
    "categoryId": 3,
    "subCategoryId": 5,
    "paymentModeId": 1,
    "accountId": 1,
    "amount": 150.50,
    "description": "Test transaction"
  }'

# Get dashboard summary
curl http://localhost:5000/api/dashboard/summary
```

See `docs/API.md` for complete API documentation.

## Documentation

### Project Specifications
- Requirements: `.kiro/specs/personal-finance-tracker/requirements.md`
- Design: `.kiro/specs/personal-finance-tracker/design.md`
- Tasks: `.kiro/specs/personal-finance-tracker/tasks.md`

### API & Deployment
- API Documentation: `docs/API.md`
- Deployment Guide: `docs/DEPLOYMENT.md`

### Component Documentation
- Frontend README: `frontend/README.md`
- Database Setup: `database/README.md`
- Context Usage: `frontend/src/contexts/README.md`
- Theme Customization: `frontend/src/theme/README.md`

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### Phase 1 (Current)
- ✅ Transaction management
- ✅ Dashboard analytics
- ✅ Category management
- ✅ Monthly tracking cycles

### Phase 2 (Future)
- [ ] User authentication and authorization
- [ ] Multi-user support
- [ ] Budget planning and tracking
- [ ] Recurring transactions
- [ ] Data export (CSV, PDF)
- [ ] Mobile app (React Native)

### Phase 3 (Future)
- [ ] Bank account integration
- [ ] Receipt scanning
- [ ] Advanced analytics
- [ ] Financial goals tracking
- [ ] Bill reminders

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Report Bug](https://github.com/your-repo/issues)
- 💡 [Request Feature](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Material-UI](https://mui.com/)
- Charts by [Recharts](https://recharts.org/)
- Backend powered by [Express.js](https://expressjs.com/)
- Database: [PostgreSQL](https://www.postgresql.org/)

---

**Made with ❤️ by the Personal Finance Tracker team**
