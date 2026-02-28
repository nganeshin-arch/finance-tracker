#!/bin/bash

# Heroku Deployment Script for Personal Finance Tracker
# Usage: ./scripts/deploy-heroku.sh [app-name]

set -e

APP_NAME=${1:-finance-tracker-api}

echo "🚀 Deploying Personal Finance Tracker to Heroku..."
echo "App Name: $APP_NAME"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   npm install -g heroku"
    exit 1
fi

# Login to Heroku
echo "📝 Logging in to Heroku..."
heroku login

# Create app if it doesn't exist
if heroku apps:info --app $APP_NAME &> /dev/null; then
    echo "✅ App $APP_NAME already exists"
else
    echo "📦 Creating new Heroku app: $APP_NAME"
    heroku create $APP_NAME
fi

# Add PostgreSQL addon if not exists
if heroku addons:info heroku-postgresql --app $APP_NAME &> /dev/null; then
    echo "✅ PostgreSQL addon already exists"
else
    echo "🗄️  Adding PostgreSQL addon..."
    heroku addons:create heroku-postgresql:mini --app $APP_NAME
fi

# Set environment variables
echo "⚙️  Setting environment variables..."
heroku config:set NODE_ENV=production --app $APP_NAME
read -p "Enter your frontend URL (e.g., https://your-app.vercel.app): " FRONTEND_URL
heroku config:set FRONTEND_URL=$FRONTEND_URL --app $APP_NAME

# Deploy backend
echo "📤 Deploying backend..."
cd backend
git init 2>/dev/null || true
git add .
git commit -m "Deploy to Heroku" 2>/dev/null || git commit --amend --no-edit
heroku git:remote -a $APP_NAME
git push heroku main -f

# Run migrations
echo "🔄 Running database migrations..."
heroku run npm run migrate --app $APP_NAME

# Open app
echo "✅ Deployment complete!"
echo "🌐 Opening app..."
heroku open --app $APP_NAME

echo ""
echo "📊 View logs: heroku logs --tail --app $APP_NAME"
echo "⚙️  View config: heroku config --app $APP_NAME"
echo "🗄️  View database: heroku pg:info --app $APP_NAME"
