# iOS Deployment Guide - Personal Finance Tracker

## Overview

This guide will help you deploy your Personal Finance Management app to iOS using Capacitor, which wraps your existing React web app into a native iOS application.

## Prerequisites

### Required Software:
1. **macOS** - iOS development requires a Mac
2. **Xcode** - Download from Mac App Store (free)
3. **Node.js** - Already installed (you're using it)
4. **CocoaPods** - iOS dependency manager

### Required Accounts:
1. **Apple ID** - Free (for testing on your device)
2. **Apple Developer Account** - $99/year (for App Store distribution)

---

## Step 1: Install Required Tools

### Install Xcode (if not already installed)
1. Open **Mac App Store**
2. Search for "Xcode"
3. Click **Get** or **Install**
4. Wait for installation (it's large, ~12GB)
5. Open Xcode once to accept license agreements

### Install Xcode Command Line Tools
```bash
xcode-select --install
```

### Install CocoaPods
```bash
sudo gem install cocoapods
```

---

## Step 2: Install Capacitor

Navigate to your frontend directory and install Capacitor:

```bash
cd frontend
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios
```

---

## Step 3: Initialize Capacitor

```bash
npx cap init
```

You'll be prompted for:
- **App name**: Personal Finance Tracker
- **App ID**: com.yourname.financetracker (use reverse domain notation)
- **Web directory**: dist (Vite's build output)

Or run with parameters:
```bash
npx cap init "Personal Finance Tracker" "com.yourname.financetracker" --web-dir=dist
```

---

## Step 4: Configure Backend URL

Since your app will run on a real device, you need to configure the backend URL.

### Option A: Use Your Computer's Local IP (for testing)

1. Find your computer's IP address:
   ```bash
   # On Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. Update `frontend/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 
     (import.meta.env.DEV 
       ? 'http://192.168.1.100:5000/api'  // Your computer's IP
       : '/api');
   ```

### Option B: Deploy Backend to Cloud (recommended for production)

Deploy your backend to:
- **Heroku** (free tier available)
- **Railway** (free tier available)
- **DigitalOcean** ($5/month)
- **AWS/Azure** (various pricing)

Then update the API URL to your deployed backend.

---

## Step 5: Build Your React App

```bash
cd frontend
npm run build
```

This creates the `dist` folder with your production build.

---

## Step 6: Add iOS Platform

```bash
npx cap add ios
```

This creates an `ios` folder with your Xcode project.

---

## Step 7: Sync Your Web App to iOS

```bash
npx cap sync ios
```

This copies your built web app into the iOS project.

---

## Step 8: Configure iOS App

### Update capacitor.config.ts

Create or update `frontend/capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.financetracker',
  appName: 'Finance Tracker',
  webDir: 'dist',
  server: {
    // For local testing, use your computer's IP
    // url: 'http://192.168.1.100:3000',
    // cleartext: true
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#ffffff'
  }
};

export default config;
```

---

## Step 9: Open in Xcode

```bash
npx cap open ios
```

This opens your project in Xcode.

---

## Step 10: Configure Xcode Project

### 1. Select Your Team
- Click on the project name in the left sidebar
- Select the target "App"
- Go to "Signing & Capabilities"
- Select your Apple ID under "Team"
- If you don't see your team, click "Add Account" and sign in

### 2. Configure Bundle Identifier
- Ensure the Bundle Identifier matches your App ID
- Example: `com.yourname.financetracker`

### 3. Set Deployment Target
- Set "iOS Deployment Target" to iOS 13.0 or higher

### 4. Configure App Icons (Optional)
- In Xcode, go to Assets.xcassets
- Click on AppIcon
- Drag and drop your app icons (various sizes)
- You can generate icons at: https://appicon.co

### 5. Configure Launch Screen (Optional)
- Customize the splash screen in LaunchScreen.storyboard

---

## Step 11: Run on Your iPhone

### Connect Your iPhone
1. Connect your iPhone to your Mac with a USB cable
2. Unlock your iPhone
3. Trust your computer if prompted

### Select Your Device
1. In Xcode, click the device dropdown (top left)
2. Select your iPhone from the list

### Build and Run
1. Click the **Play** button (▶️) in Xcode
2. Wait for the build to complete
3. The app will install and launch on your iPhone

### Trust Developer Certificate (First Time)
1. On your iPhone, go to **Settings** > **General** > **VPN & Device Management**
2. Find your Apple ID
3. Tap **Trust**
4. Go back and launch the app

---

## Step 12: Test the App

### Things to Test:
- [ ] App launches successfully
- [ ] Login works
- [ ] Can create transactions
- [ ] Can view dashboard
- [ ] Indian currency (₹) displays correctly
- [ ] All features work as expected
- [ ] App works offline (if applicable)

---

## Step 13: Update Backend for Mobile

### Allow Mobile Access

Update `backend/.env`:
```env
# Add your computer's IP or deployed backend URL
FRONTEND_URL=http://192.168.1.100:3000,capacitor://localhost,http://localhost
```

Update `backend/src/index.ts` CORS configuration:
```typescript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'capacitor://localhost',  // Allow Capacitor
    'http://localhost',       // Allow local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

Restart your backend server.

---

## Step 14: Deploy to App Store (Optional)

### Requirements:
- Apple Developer Account ($99/year)
- App Store Connect account
- App icons and screenshots
- Privacy policy
- App description

### Steps:
1. **Archive Your App**
   - In Xcode: Product > Archive
   - Wait for archive to complete

2. **Upload to App Store Connect**
   - Click "Distribute App"
   - Select "App Store Connect"
   - Follow the wizard

3. **Create App in App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Click "My Apps" > "+" > "New App"
   - Fill in app information

4. **Submit for Review**
   - Add screenshots
   - Add description
   - Set pricing (free or paid)
   - Submit for review

5. **Wait for Approval**
   - Usually takes 1-3 days
   - Apple will review your app

---

## Troubleshooting

### Build Errors

**Error: "No signing certificate found"**
- Solution: Add your Apple ID in Xcode preferences

**Error: "Unable to install app"**
- Solution: Trust developer certificate on iPhone (Settings > General > Device Management)

**Error: "App crashes on launch"**
- Solution: Check Xcode console for errors
- Ensure backend URL is correct
- Check network permissions

### Network Issues

**API calls not working**
- Ensure backend is running
- Check backend URL in api.ts
- Verify CORS settings
- Check iPhone and computer are on same WiFi

**CORS errors**
- Add Capacitor origins to backend CORS config
- Restart backend server

### Performance Issues

**App is slow**
- Build production version: `npm run build`
- Optimize images
- Enable caching
- Minimize API calls

---

## Alternative: Progressive Web App (PWA)

If you don't want to go through the App Store, you can make your app a PWA:

### Advantages:
- No App Store approval needed
- No Apple Developer account needed
- Easier updates
- Works on all platforms

### How to Use:
1. Deploy your app to a web server with HTTPS
2. On iPhone, open Safari
3. Navigate to your app URL
4. Tap the Share button
5. Tap "Add to Home Screen"
6. The app icon appears on your home screen

### Add PWA Support:

Create `frontend/public/manifest.json`:
```json
{
  "name": "Personal Finance Tracker",
  "short_name": "Finance",
  "description": "Track your personal finances",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `frontend/index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#3b82f6">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" href="/icon-192.png">
```

---

## Recommended Approach for Personal Use

### For Testing (Free):
1. Use Capacitor with local backend
2. Install on your iPhone via Xcode
3. No App Store needed
4. Perfect for personal use

### For Family/Friends (Free):
1. Deploy backend to free hosting (Railway, Heroku)
2. Deploy frontend to Vercel/Netlify (free)
3. Use as PWA (Add to Home Screen)
4. Share the URL

### For Public Distribution ($99/year):
1. Use Capacitor
2. Get Apple Developer account
3. Submit to App Store
4. Available to everyone

---

## Quick Start Commands

```bash
# 1. Install Capacitor
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 2. Initialize
npx cap init "Finance Tracker" "com.yourname.financetracker" --web-dir=dist

# 3. Build web app
npm run build

# 4. Add iOS platform
npx cap add ios

# 5. Sync
npx cap sync ios

# 6. Open in Xcode
npx cap open ios

# 7. Click Play in Xcode to run on your iPhone
```

---

## Support Resources

- **Capacitor Docs**: https://capacitorjs.com/docs/ios
- **Xcode Help**: https://developer.apple.com/xcode/
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/

---

## Summary

✅ **Easiest**: PWA (Add to Home Screen) - Free, no App Store
✅ **Best for Personal Use**: Capacitor + Xcode - Free, native app
✅ **Best for Distribution**: App Store - $99/year, reaches everyone

Choose the approach that fits your needs and budget!
