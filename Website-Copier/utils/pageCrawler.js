/**
 * Page Crawler Utility
 * Discovers and crawls all pages on a website
 */

class PageCrawler {
  constructor(baseUrl, settings = {}) {
    this.baseUrl = baseUrl;
    this.baseUrlObj = new URL(baseUrl);
    this.settings = {
      maxDepth: settings.maxDepth || 2,
      maxPages: settings.maxPages || 50,
      sameDomainOnly: settings.sameDomainOnly !== false,
      ignorePatterns: settings.ignorePatterns || [
        /\.(pdf|zip|doc|docx|xls|xlsx)$/i,
        /\/api\//i,
        /\/admin\//i,
        /\/login/i,
        /\/logout/i,
        /#/  // Ignore hash links
      ],
      ...settings
    };
    this.visitedUrls = new Set();
    this.pagesToVisit = [];
    this.crawledPages = [];
  }

  /**
   * Discover all internal links on current page
   */
  discoverLinks() {
    const links = new Set();
    const baseUrl = this.baseUrl;
    
    // Find all <a> tags with href
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      try {
        // Resolve relative URLs
        const url = new URL(href, baseUrl);
        
        // Check if same domain
        if (this.settings.sameDomainOnly && url.origin !== this.baseUrlObj.origin) {
          return;
        }
        
        // Check ignore patterns
        if (this.shouldIgnore(url.href)) {
          return;
        }
        
        // Remove hash and query params for comparison
        const cleanUrl = url.origin + url.pathname;
        
        // Add to links set
        links.add(cleanUrl);
      } catch (e) {
        // Invalid URL, skip
        console.warn('Invalid URL:', href);
      }
    });
    
    return Array.from(links);
  }

  /**
   * Check if URL should be ignored
   */
  shouldIgnore(url) {
    return this.settings.ignorePatterns.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(url);
      } else if (typeof pattern === 'string') {
        return url.includes(pattern);
      }
      return false;
    });
  }

  /**
   * Check if URL has been visited
   */
  isVisited(url) {
    return this.visitedUrls.has(url);
  }

  /**
   * Mark URL as visited
   */
  markVisited(url) {
    this.visitedUrls.add(url);
  }

  /**
   * Get relative path for a page URL
   */
  getPagePath(url) {
    try {
      const urlObj = new URL(url);
      const baseUrlObj = new URL(this.baseUrl);
      
      if (urlObj.origin !== baseUrlObj.origin) {
        // External page - put in external folder
        const domain = urlObj.hostname.replace(/[^a-z0-9]/gi, '_');
        const path = urlObj.pathname || '/index.html';
        const filename = path === '/' || path.endsWith('/') 
          ? 'index.html' 
          : path.split('/').pop() || 'index.html';
        return `pages/external/${domain}/${filename}`;
      }
      
      // Internal page
      let path = urlObj.pathname;
      if (path === '/' || path === '') {
        return 'index.html';
      }
      
      // Ensure .html extension
      if (!path.match(/\.(html|htm)$/i)) {
        if (path.endsWith('/')) {
          path = path + 'index.html';
        } else {
          path = path + '.html';
        }
      }
      
      // Remove leading slash
      path = path.replace(/^\//, '');
      
      // Put in pages folder
      return `pages/${path}`;
    } catch (e) {
      return `pages/${this.sanitizeFilename(url)}.html`;
    }
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9._-]/gi, '_').substring(0, 200);
  }

  /**
   * Build sitemap from discovered links
   */
  buildSitemap(links) {
    const sitemap = {
      baseUrl: this.baseUrl,
      pages: []
    };
    
    links.forEach(link => {
      if (!this.isVisited(link)) {
        sitemap.pages.push({
          url: link,
          depth: 0, // Will be calculated during crawl
          path: this.getPagePath(link)
        });
      }
    });
    
    return sitemap;
  }
}

// Export for use in content script
if (typeof module !== "undefined" && module.exports) {
  module.exports = PageCrawler;
}

