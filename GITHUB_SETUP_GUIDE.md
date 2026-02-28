# GitHub Setup Guide - Step by Step

## Step 1: Create GitHub Repository

1. **Go to** https://github.com/new
2. **Fill in**:
   - Repository name: `finance-tracker` (or any name you like)
   - Description: "Personal Finance Management App"
   - Visibility: **Private** (recommended) or Public
3. **DO NOT** check "Initialize with README"
4. **Click** "Create repository"

You'll see a page with setup instructions. **Keep this page open!**

---

## Step 2: Create .gitignore File

Before pushing, create a `.gitignore` file to exclude unnecessary files:

Create `.gitignore` in your project root:

```
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.production
backend/.env
frontend/.env

# Build outputs
dist/
build/
*/dist/
*/build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
npm-debug.log*
logs/

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
.cache/

# Database
*.sqlite
*.db
