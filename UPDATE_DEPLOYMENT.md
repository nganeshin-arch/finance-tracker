# Update Your Netlify Deployment

## 🔄 Quick Update (2 Minutes)

### Step 1: Build Latest Code

Run this:
```bash
update-netlify.bat
```

This will:
- Build your latest code
- Create a fresh `dist` folder
- Open the folder for you

---

### Step 2: Update on Netlify

You have two options:

#### Option A: Netlify Drop (New Deployment)

1. **Go to** https://app.netlify.com/drop
2. **Drag** the `dist` folder onto the page
3. **Done!** You get a new URL

**Note**: This creates a NEW site. If you want to update your existing site, use Option B.

#### Option B: Update Existing Site

1. **Go to** https://app.netlify.com
2. **Sign in**
3. **Click** on your site name
4. **Go to** "Deploys" tab
5. **Drag** the `dist` folder to the drop zone
6. **Wait** ~30 seconds
7. **Done!** Your site is updated

---

## 📱 Test on iPhone

After updating:

1. **Open Safari** on iPhone
2. **Go to** your Netlify URL
3. **Hard refresh**: Pull down to refresh
4. **Test** the new features

If you already have it installed:
- The PWA will update automatically
- Or delete and re-add to Home Screen

---

## 🎯 What Gets Updated

When you redeploy, these changes go live:

✅ All code changes
✅ UI improvements (Georgia fonts, premium styling)
✅ Bug fixes
✅ New features
✅ PWA updates

---

## 🔍 Verify Your Update

### Check if Update Worked:

1. **Open** your Netlify site
2. **Check** the heading fonts (should be Georgia)
3. **Test** transaction form (should have ₹ symbol)
4. **Create** a transaction (form should reset after)
5. **Check** categories (should have all income/expense categories)

---

## ⚡ Quick Reference

### Every Time You Make Changes:

```bash
# 1. Build
update-netlify.bat

# 2. Upload to Netlify
# - Go to your site's Deploys tab
# - Drag dist folder
# - Done!
```

---

## 💡 Pro Tips

### Faster Updates:

1. **Keep Netlify dashboard open** in a browser tab
2. **Run** `update-netlify.bat`
3. **Drag** dist folder to Netlify
4. **Refresh** your iPhone to see changes

### Automatic Updates (Advanced):

If you want automatic deployments:

1. **Push code to GitHub** (fix the Git issues first)
2. **Connect** Netlify to your GitHub repo
3. **Every push** auto-deploys
4. **No manual uploads** needed

---

## 🆘 Troubleshooting

### "Site not updating"

**Solution**: Hard refresh
- Desktop: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- iPhone: Pull down to refresh in Safari

### "Old version still showing"

**Solution**: Clear cache
- Desktop: Clear browser cache
- iPhone: Settings → Safari → Clear History and Website Data

### "Build fails"

**Solution**: Check for errors
- Read the error message
- Fix the code issue
- Run `update-netlify.bat` again

---

## ✅ Update Checklist

- [ ] Run `update-netlify.bat`
- [ ] Wait for build to complete
- [ ] Go to Netlify dashboard
- [ ] Drag dist folder to Deploys tab
- [ ] Wait for deployment (~30 seconds)
- [ ] Test on desktop browser
- [ ] Test on iPhone Safari
- [ ] Verify all features work
- [ ] Share updated URL if needed

---

## 🎉 That's It!

Your Netlify site is now updated with your latest code!

**Time**: ~2 minutes
**Cost**: $0
**Result**: Latest version live on iPhone!

Enjoy your updated Personal Finance Tracker! 💰📱✨
