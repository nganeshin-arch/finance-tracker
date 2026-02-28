# Database Setup

## PostgreSQL Installation

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the postgres user
4. Default port is 5432

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Database Creation

1. Open PostgreSQL command line (psql) or use pgAdmin
2. Run the setup script:
```bash
psql -U postgres -f database/setup.sql
```

Or manually:
```sql
CREATE DATABASE finance_tracker;
```

## Configuration

1. Copy `backend/.env.example` to `backend/.env`
2. Update the database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_tracker
DB_USER=postgres
DB_PASSWORD=your_password_here
```

## Migrations

Database migrations will be run from the backend project:
```bash
cd backend
npm run migrate
```

## Verify Connection

You can test the database connection using psql:
```bash
psql -U postgres -d finance_tracker
```
