/**
 * URL Rewriter Utility
 * Rewrites URLs in HTML/CSS for offline compatibility
 */

class URLRewriter {
  constructor(baseUrl, urlMap) {
    this.baseUrl = baseUrl;
    this.urlMap = urlMap; // Map of original URL -> local path
    this.baseUrlObj = new URL(baseUrl);
  }

  /**
   * Rewrite URLs in HTML content
   */
  rewriteHTML(html) {
    let rewritten = html;
    
    // Rewrite all URLs in the map
    this.urlMap.forEach((localPath, originalUrl) => {
      const escapedUrl = this.escapeRegex(originalUrl);
      const regex = new RegExp(escapedUrl, "g");
      rewritten = rewritten.replace(regex, localPath);
    });
    
    // Also rewrite relative URLs that might have been missed
    rewritten = this.rewriteRelativeUrls(rewritten);
    
    return rewritten;
  }

  /**
   * Rewrite URLs in CSS content
   */
  rewriteCSS(cssText) {
    let rewritten = cssText;
    
    // Rewrite URLs in url() functions
    this.urlMap.forEach((localPath, originalUrl) => {
      const escapedUrl = this.escapeRegex(originalUrl);
      // Match url() with various quote styles
      const regex = new RegExp(`url\\(["']?${escapedUrl}["']?\\)`, "gi");
      rewritten = rewritten.replace(regex, `url("${localPath}")`);
    });
    
    return rewritten;
  }

  /**
   * Rewrite relative URLs to absolute local paths
   */
  rewriteRelativeUrls(html) {
    // This handles cases where URLs are relative but not in our map
    // For now, we'll leave them as-is since they should work relative to index.html
    return html;
  }

  /**
   * Escape special regex characters
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Create a base tag for relative URL resolution
   */
  injectBaseTag(html) {
    // Check if base tag already exists
    if (/<base\s/i.test(html)) {
      return html;
    }
    
    // Inject base tag in head
    const baseTag = `<base href="./">\n`;
    
    if (/<head[^>]*>/i.test(html)) {
      return html.replace(/(<head[^>]*>)/i, `$1\n    ${baseTag}`);
    } else if (/<html[^>]*>/i.test(html)) {
      return html.replace(/(<html[^>]*>)/i, `$1\n  <head>\n    ${baseTag}  </head>`);
    }
    
    return html;
  }
}

// Export for use in content script
if (typeof module !== "undefined" && module.exports) {
  module.exports = URLRewriter;
}

