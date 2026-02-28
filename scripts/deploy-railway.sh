#!/bin/bash

# Railway Deployment Script for Personal Finance Tracker
# Usage: ./scripts/deploy-railway.sh

set -e

echo "🚀 Deploying Personal Finance Tracker to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "📝 Logging in to Railway..."
railway login

# Initialize project
echo "📦 Initializing Railway project..."
railway init

# Add PostgreSQL
echo "🗄️  Adding PostgreSQL database..."
railway add

# Deploy backend
echo "📤 Deploying backend..."
cd backend
railway up

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to Railway dashboard: https://railway.app/dashboard"
echo "2. Set environment variable FRONTEND_URL to your frontend URL"
echo "3. Run migrations: railway run npm run migrate"
echo "4. Get your backend URL from the Railway dashboard"
echo "5. Deploy frontend with the backend URL"
