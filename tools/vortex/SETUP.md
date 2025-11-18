# Vortex Setup Guide

## 🚀 Accessing Vortex Dashboard

### Production URL
```
https://main--milo--shkhan91.aem.page/tools/vortex/dashboard
```

### Local Development
```
http://localhost:3000/tools/vortex/dashboard
```

### Alternative URLs
```
http://localhost:3000/tools/vortex/  (redirects to dashboard)
http://localhost:3000/tools/vortex/index.html  (redirects to dashboard)
```

## 📁 File Structure

```
tools/vortex/
├── dashboard.html       # Main HTML page (Milo-compatible) ⭐ RENAMED
├── vortex.css           # Styles
├── vortex.js            # Main application logic
├── ai-service.js        # AI integration layer
├── video-data.js        # Mock data
├── index.html           # Redirect to dashboard.html
├── test-local.html      # Standalone test version
└── [documentation files]
```

## 🔧 Integration with Milo

Vortex follows the Milo tools pattern:

### HTML Structure
- No DOCTYPE (Milo adds it)
- Uses `<script type="module">` with `import init from './vortex.js'`
- Includes Adobe Global Navigation and Footer via meta tags:
  ```html
  <meta name="gnav-source" content="https://www.adobe.com/gnav">
  <meta name="footer-source" content="https://www.adobe.com/footer">
  ```
- Standard Milo structure: `<header>`, `<main>`, `<footer>`

### JavaScript
- Exports default `init()` function
- Self-contained with no external dependencies
- Works with Milo's module system

### CSS
- Standalone stylesheet
- Works with Milo's global styles and Adobe navigation
- Responsive and modern

## 🏃 Running Locally

### Option 1: With Milo Dev Server (Recommended)
```bash
cd /Users/shkhan/milo
npm run up
# Then open: http://localhost:3000/tools/vortex/dashboard
```
**Note**: This includes Adobe Global Navigation and Footer

### Option 2: Standalone (for testing)
```bash
cd /Users/shkhan/milo/tools/vortex
python3 -m http.server 8000
# Then open: http://localhost:8000/test-local.html
```

### Option 3: Simple File Open
```bash
# Just open test-local.html in your browser
open test-local.html
```

## 🌐 Deployment to AEM

### Steps to Deploy

1. **Commit your changes:**
   ```bash
   cd /Users/shkhan/milo
   git add tools/vortex/
   git commit -m "Add Vortex AI Video Command Center"
   ```

2. **Push to your branch:**
   ```bash
   git push origin your-branch-name
   ```

3. **Access via AEM:**
   ```
   https://main--milo--shkhan91.aem.page/tools/vortex/vortex
   ```

   Or with branch name:
   ```
   https://your-branch--milo--shkhan91.aem.page/tools/vortex/vortex
   ```

## ✅ Verification Checklist

- [ ] Files are in `/tools/vortex/` directory
- [ ] No linter errors (`npm run lint`)
- [ ] `vortex.html` exists and is properly formatted
- [ ] `vortex.js` exports `init()` function
- [ ] `vortex.css` is linked correctly
- [ ] All files are committed to git
- [ ] Branch is pushed to remote

## 🐛 Troubleshooting

### 404 Error
**Problem**: `https://main--milo--shkhan91.aem.page/tools/vortex/vortex` returns 404

**Solutions**:
1. Check if files are committed and pushed
2. Wait a few minutes for AEM to rebuild (can take 2-5 minutes)
3. Try clearing browser cache
4. Verify the branch name in URL matches your git branch
5. Check if you need `.html` extension: `/tools/vortex/vortex.html`

### Blank Page
**Problem**: Page loads but nothing shows

**Solutions**:
1. Open browser console (F12) to check for errors
2. Verify `vortex.js` is loading correctly
3. Check that init() function is being called
4. Ensure CSS file is loading

### JavaScript Errors
**Problem**: Console shows module errors

**Solutions**:
1. Check that vortex.js exports `init` as default
2. Verify no import errors in the code
3. Make sure createTag helper function is defined

### Styles Not Loading
**Problem**: Page appears unstyled

**Solutions**:
1. Check CSS file path in HTML: `href="./vortex.css"`
2. Verify CSS file exists in same directory
3. Check browser network tab for 404 on CSS file

## 📝 Quick Test Commands

```bash
# Check if files exist
ls -la /Users/shkhan/milo/tools/vortex/

# Check git status
git status

# Run linter
npm run lint -- tools/vortex/

# Test locally
npm run up
```

## 🎯 URLs to Try

### After Deployment
- Main: `https://main--milo--shkhan91.aem.page/tools/vortex/vortex`
- With .html: `https://main--milo--shkhan91.aem.page/tools/vortex/vortex.html`
- Index: `https://main--milo--shkhan91.aem.page/tools/vortex/` (redirects)

### Local Development
- Milo dev: `http://localhost:3000/tools/vortex/vortex`
- Direct: `http://localhost:3000/tools/vortex/vortex.html`
- Standalone: `file:///Users/shkhan/milo/tools/vortex/test-local.html`

## 🔑 Key Points

1. **File Naming**: Milo tools often work without `.html` extension
2. **Module System**: Must use ES6 modules with default export
3. **Self-Contained**: No external dependencies except what's in the repo
4. **Deployment Time**: AEM can take 2-5 minutes to reflect changes
5. **Branch Names**: URL changes based on git branch name

## 📞 Need Help?

If you're still having issues:
1. Check the Milo repo documentation
2. Look at other working tools in `/tools/` for examples
3. Verify your git branch is correctly deployed
4. Check AEM build logs if you have access

---

**Built for Adobe Hackathon 2024** 🚀

