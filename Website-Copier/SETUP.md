# 🚀 Quick Setup Guide

## Step-by-Step Installation

### 1. Prepare the Extension Folder

Make sure all files are in one folder:
```
Copy_website/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── popup.css
├── utils/
│   ├── assetScanner.js
│   └── urlRewriter.js
└── icons/
    ├── icon16.png (optional for testing)
    ├── icon48.png (optional for testing)
    └── icon128.png (optional for testing)
```

### 2. Load Extension in Chrome/Edge

1. Open Chrome or Edge browser
2. Navigate to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
3. Enable **Developer mode** (toggle switch in top-right)
4. Click **"Load unpacked"** button
5. Select the `Copy_website` folder
6. The extension should now appear in your extensions list

### 3. Pin the Extension

1. Click the **puzzle piece icon** (extensions) in the toolbar
2. Find **"Website Copier"** in the list
3. Click the **pin icon** to keep it visible in the toolbar

### 4. Create Icons (Optional but Recommended)

The extension needs icon files. You have two options:

**Option A: Create Simple Icons**
- Create 3 PNG files: `icon16.png`, `icon48.png`, `icon128.png`
- Use any image editor or online tool
- Simple colored squares work fine for testing

**Option B: Use Placeholder**
- The extension will work without icons
- Chrome may show a warning, but functionality is unaffected

### 5. Test the Extension

1. Navigate to any website (e.g., `https://example.com`)
2. Click the **Website Copier** icon in the toolbar
3. Click **"Copy Website"** button
4. Wait for the download to complete
5. Check your Downloads folder for the ZIP file

## 🎯 First Test

Try copying a simple static website first:

1. Go to: `https://example.com`
2. Click extension icon → "Copy Website"
3. Wait for completion
4. Extract ZIP and open `index.html`

This should work perfectly!

## ⚠️ Troubleshooting

### Extension Not Loading

- Make sure all files are in the same folder
- Check that `manifest.json` is valid JSON
- Look for errors in `chrome://extensions/` page

### "Failed to start capture"

- Make sure you're on a regular webpage (not `chrome://` pages)
- Refresh the page and try again
- Check browser console (F12) for errors

### No Icons Showing

- Icons are optional for functionality
- Create placeholder PNG files if you want icons
- Extension works fine without them

### ZIP File Not Downloading

- Check browser download settings
- Make sure downloads aren't blocked
- Check browser console for errors

## ✅ Verification Checklist

- [ ] Extension appears in `chrome://extensions/`
- [ ] Extension icon visible in toolbar
- [ ] Popup opens when clicking icon
- [ ] Can see current page URL in popup
- [ ] "Copy Website" button is clickable
- [ ] Progress bar appears when downloading
- [ ] ZIP file downloads successfully

## 🎉 You're Ready!

Once the extension loads successfully, you can start copying websites!

**Pro Tip**: Start with simple static websites before trying complex SPAs or WordPress sites.

---

For detailed usage instructions, see [README.md](README.md)

