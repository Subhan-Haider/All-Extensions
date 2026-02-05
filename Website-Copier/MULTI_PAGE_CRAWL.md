# 🌐 Multi-Page Crawling Feature

## ✅ NEW FEATURE: Copy All Website Pages

The extension now supports **multi-page crawling** to copy entire websites, not just single pages!

## 🎯 How It Works

### When "Full Website" Mode is Selected:

1. **Starts with current page** - Captures the page you're on
2. **Discovers all internal links** - Finds all `<a>` tags pointing to same-domain pages
3. **Crawls discovered pages** - Visits each page and captures it
4. **Follows links recursively** - Can crawl multiple levels deep
5. **Deduplicates assets** - Same file downloaded only once across all pages
6. **Organizes in ZIP** - All pages saved in organized folder structure

## ⚙️ Settings

### Crawl Depth
- **Default**: 2 levels
- **Range**: 1-5 levels
- **What it means**: How many link-clicks deep to crawl
  - Depth 1: Only pages linked from current page
  - Depth 2: Pages linked from current page + their linked pages
  - Depth 3: And so on...

### Max Pages
- **Default**: 50 pages
- **Range**: 1-200 pages
- **What it means**: Maximum number of pages to crawl (prevents infinite loops)

## 📁 Folder Structure

When crawling multiple pages, the ZIP structure is:

```
website-name/
├── index.html              # Homepage
├── pages/
│   ├── about.html
│   ├── contact.html
│   ├── products/
│   │   └── index.html
│   └── blog/
│       └── post-1.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── images/
│   └── logo.png
└── fonts/
    └── font.woff2
```

## 🚫 What Gets Ignored

The crawler automatically ignores:
- External links (different domains)
- File downloads (.pdf, .zip, .doc, etc.)
- API endpoints (/api/*)
- Admin pages (/admin/*)
- Login/logout pages
- Hash links (#section)
- JavaScript/mailto/tel links

## 📊 Progress Tracking

During multi-page crawl, you'll see:
- **Pages**: X / Y (pages crawled / total discovered)
- **Files**: X / Y (assets downloaded)
- **Size**: Total size of all downloaded files
- **Time**: Elapsed time

## ⚠️ Important Notes

### Performance
- **Large websites**: May take a long time (minutes to hours)
- **Many pages**: Uses more memory and bandwidth
- **Rate limiting**: Some websites may block rapid requests

### Limitations
- **JavaScript navigation**: Can't follow links created by JavaScript after page load
- **Login required**: Can't access pages behind authentication
- **Dynamic content**: API-loaded content won't be captured
- **Infinite loops**: Max pages limit prevents this

### Best Practices
1. **Start small**: Test with depth 1, max 10 pages first
2. **Check website**: Make sure it allows crawling (check robots.txt)
3. **Respect limits**: Don't crawl too aggressively
4. **Use "Current Page Only"**: For single pages or testing

## 🎯 Use Cases

### ✅ Good For:
- Small to medium websites (10-50 pages)
- Documentation sites
- Portfolio websites
- Blog sites
- Static websites

### ⚠️ Challenging For:
- Very large websites (1000+ pages)
- JavaScript-heavy SPAs
- Sites with complex authentication
- Sites that block crawlers

## 🔧 Technical Details

### How Links Are Discovered
1. Scans all `<a href="">` tags on page
2. Resolves relative URLs to absolute
3. Filters to same-domain only
4. Removes duplicates
5. Applies ignore patterns

### How Pages Are Crawled
1. Opens each discovered URL in same tab
2. Waits for page to load completely
3. Injects content script
4. Captures HTML and assets
5. Discovers new links
6. Repeats for next depth level

### Asset Deduplication
- Assets are stored by URL
- Same asset downloaded once
- Shared across all pages
- Organized in common folders (css/, js/, images/)

## 🚀 Getting Started

1. **Navigate** to website homepage
2. **Click extension icon**
3. **Select "Full Website"** mode
4. **Adjust settings** (optional):
   - Set crawl depth (1-5)
   - Set max pages (1-200)
5. **Click "Copy Website"**
6. **Wait for completion** (watch progress)
7. **Extract ZIP** and browse offline!

## 📝 Example

**Website**: `https://example.com`

**Structure**:
- `/` (homepage)
- `/about`
- `/contact`
- `/products`
- `/products/item-1`
- `/blog`
- `/blog/post-1`

**With depth 2, max 50 pages**:
- Crawls all pages above
- Follows links from each page
- Stops at 50 pages or depth 2, whichever comes first

**Result**: Complete website copy in ZIP file!

---

**Enjoy crawling! 🕷️🌐**

