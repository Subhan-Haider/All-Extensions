/**
 * Asset Scanner Utility
 * Advanced asset discovery with deduplication and filtering
 */

class AssetScanner {
  constructor(baseUrl, settings = {}) {
    this.baseUrl = baseUrl;
    this.settings = {
      ignoreExternal: settings.ignoreExternal || false,
      ignoreAnalytics: settings.ignoreAnalytics || true,
      maxFileSize: settings.maxFileSize || 50 * 1024 * 1024,
      ...settings
    };
    this.assets = new Map();
    this.seenUrls = new Set();
  }

  /**
   * Scan all assets from the document
   */
  scanAll() {
    this.scanCSS();
    this.scanJavaScript();
    this.scanImages();
    this.scanFonts();
    this.scanMedia();
    this.scanBackgroundImages();
    this.scanInlineAssets();
    
    return Array.from(this.assets.values());
  }

  /**
   * Scan CSS assets
   */
  scanCSS() {
    // Link stylesheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute("href");
      if (href && this.shouldInclude(href)) {
        this.addAsset(href, "css", "css");
      }
    });

    // @import in style tags
    document.querySelectorAll("style").forEach(style => {
      const cssText = style.textContent;
      const imports = this.extractCSSImports(cssText);
      imports.forEach(url => {
        if (this.shouldInclude(url)) {
          this.addAsset(url, "css", "css");
        }
      });
    });
  }

  /**
   * Scan JavaScript assets
   */
  scanJavaScript() {
    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute("src");
      if (src && this.shouldInclude(src)) {
        this.addAsset(src, "js", "js");
      }
    });
  }

  /**
   * Scan image assets
   */
  scanImages() {
    // Regular images
    document.querySelectorAll("img").forEach(img => {
      const src = img.getAttribute("src") || 
                  img.getAttribute("data-src") || 
                  img.getAttribute("data-lazy-src") ||
                  img.getAttribute("data-original");
      if (src && this.shouldInclude(src)) {
        this.addAsset(src, "image", "images");
      }
    });

    // Picture sources
    document.querySelectorAll("picture source").forEach(source => {
      const srcset = source.getAttribute("srcset");
      if (srcset) {
        this.parseSrcSet(srcset).forEach(url => {
          if (this.shouldInclude(url)) {
            this.addAsset(url, "image", "images");
          }
        });
      }
    });

    // Video posters
    document.querySelectorAll("video[poster]").forEach(video => {
      const poster = video.getAttribute("poster");
      if (poster && this.shouldInclude(poster)) {
        this.addAsset(poster, "image", "images");
      }
    });
  }

  /**
   * Scan font assets
   */
  scanFonts() {
    document.querySelectorAll("style").forEach(style => {
      const cssText = style.textContent;
      const fontUrls = this.extractFontUrls(cssText);
      fontUrls.forEach(url => {
        if (this.shouldInclude(url) && this.isFontFile(url)) {
          this.addAsset(url, "font", "fonts");
        }
      });
    });
  }

  /**
   * Scan media assets (video, audio)
   */
  scanMedia() {
    document.querySelectorAll("video source, audio source").forEach(source => {
      const src = source.getAttribute("src");
      if (src && this.shouldInclude(src)) {
        this.addAsset(src, "media", "media");
      }
    });
  }

  /**
   * Scan background images from computed styles
   */
  scanBackgroundImages() {
    const elements = document.querySelectorAll("*");
    elements.forEach(el => {
      try {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        
        if (bgImage && bgImage !== "none") {
          const url = this.extractUrlFromStyle(bgImage);
          if (url && this.shouldInclude(url)) {
            this.addAsset(url, "image", "images");
          }
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    });
  }

  /**
   * Scan inline assets (data URLs, embedded content)
   */
  scanInlineAssets() {
    // This is a placeholder for future inline asset extraction
    // Could include SVG content, embedded fonts, etc.
  }

  /**
   * Add asset if not already seen
   */
  addAsset(url, type, folder) {
    const resolvedUrl = this.resolveUrl(url);
    if (!resolvedUrl || this.seenUrls.has(resolvedUrl)) {
      return;
    }

    this.seenUrls.add(resolvedUrl);
    
    this.assets.set(resolvedUrl, {
      url: resolvedUrl,
      type: type,
      localPath: this.getLocalPath(resolvedUrl, folder),
      originalUrl: url
    });
  }

  /**
   * Check if URL should be included based on settings
   */
  shouldInclude(url) {
    try {
      const resolved = this.resolveUrl(url);
      if (!resolved) return false;

      const urlObj = new URL(resolved);
      const baseUrlObj = new URL(this.baseUrl);

      // Ignore external domains if setting is enabled
      if (this.settings.ignoreExternal && urlObj.origin !== baseUrlObj.origin) {
        return false;
      }

      // Ignore analytics and tracking
      if (this.settings.ignoreAnalytics) {
        const analyticsDomains = [
          "google-analytics.com",
          "googletagmanager.com",
          "facebook.com/tr",
          "doubleclick.net",
          "adservice.google",
          "analytics.js",
          "gtag.js"
        ];
        
        if (analyticsDomains.some(domain => urlObj.hostname.includes(domain))) {
          return false;
        }
      }

      // Ignore data URLs and blob URLs
      if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("javascript:")) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Resolve relative URL to absolute
   */
  resolveUrl(url, base = this.baseUrl) {
    try {
      if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("javascript:")) {
        return null;
      }
      return new URL(url, base).href;
    } catch (e) {
      return null;
    }
  }

  /**
   * Get local file path for asset
   */
  getLocalPath(url, defaultFolder) {
    try {
      const urlObj = new URL(url);
      const baseUrlObj = new URL(this.baseUrl);
      
      if (urlObj.origin === baseUrlObj.origin) {
        const path = urlObj.pathname;
        const filename = path.split("/").pop() || "file";
        const ext = this.getFileExtension(url);
        return `${defaultFolder}/${this.sanitizeFilename(filename)}${ext || ""}`;
      } else {
        const domain = urlObj.hostname.replace(/[^a-z0-9]/gi, "_");
        const filename = urlObj.pathname.split("/").pop() || "file";
        const ext = this.getFileExtension(url);
        return `external/${domain}/${this.sanitizeFilename(filename)}${ext || ""}`;
      }
    } catch (e) {
      const filename = url.split("/").pop() || "file";
      return `${defaultFolder}/${this.sanitizeFilename(filename)}`;
    }
  }

  /**
   * Extract CSS @import URLs
   */
  extractCSSImports(cssText) {
    const imports = [];
    const importRegex = /@import\s+["']([^"']+)["']/g;
    let match;
    
    while ((match = importRegex.exec(cssText)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  /**
   * Extract font URLs from CSS
   */
  extractFontUrls(cssText) {
    const urls = [];
    const urlRegex = /url\(["']?([^"')]+)["']?\)/g;
    let match;
    
    while ((match = urlRegex.exec(cssText)) !== null) {
      urls.push(match[1]);
    }
    
    return urls;
  }

  /**
   * Extract URL from CSS style value
   */
  extractUrlFromStyle(styleValue) {
    const match = styleValue.match(/url\(["']?([^"')]+)["']?\)/);
    return match ? match[1] : null;
  }

  /**
   * Parse srcset attribute
   */
  parseSrcSet(srcset) {
    const urls = [];
    const parts = srcset.split(",");
    
    parts.forEach(part => {
      const url = part.trim().split(/\s+/)[0];
      if (url) {
        const resolved = this.resolveUrl(url);
        if (resolved) urls.push(resolved);
      }
    });
    
    return urls;
  }

  /**
   * Check if URL is a font file
   */
  isFontFile(url) {
    const fontExtensions = [".woff", ".woff2", ".ttf", ".otf", ".eot"];
    return fontExtensions.some(ext => url.toLowerCase().includes(ext));
  }

  /**
   * Get file extension from URL
   */
  getFileExtension(url) {
    try {
      const pathname = new URL(url).pathname;
      const match = pathname.match(/\.([a-z0-9]+)$/i);
      return match ? `.${match[1]}` : "";
    } catch (e) {
      return "";
    }
  }

  /**
   * Sanitize filename for filesystem
   */
  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9._-]/gi, "_").substring(0, 200);
  }
}

// Export for use in content script
if (typeof module !== "undefined" && module.exports) {
  module.exports = AssetScanner;
}

