#!/bin/bash

# Vercel Deployment Script for Personal Finance Tracker Frontend
# Usage: ./scripts/deploy-vercel.sh

set -e

echo "🚀 Deploying Personal Finance Tracker Frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Get backend URL
read -p "Enter your backend API URL (e.g., https://your-api.railway.app/api): " API_URL

# Deploy frontend
echo "📤 Deploying frontend..."
cd frontend

# Set environment variable
echo "⚙️  Setting environment variable..."
vercel env add VITE_API_BASE_URL production <<< "$API_URL"

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📊 View deployment: vercel ls"
echo "⚙️  View env vars: vercel env ls"
echo "🌐 Your app is live!"
