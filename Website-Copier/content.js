/**
 * Content Script
 * Captures DOM, discovers assets, and coordinates with background worker
 */

// Note: Utility classes (AssetScanner, URLRewriter) are defined in utils/
// but content scripts can't directly import them. The fallback implementations
// in this file will be used. For production, you could inject these as script tags.

// JSZip should be loaded via manifest.json content_scripts
// Check if it's available
if (typeof JSZip === "undefined") {
  console.warn("JSZip not found in global scope. It should be loaded via manifest.json content_scripts.");
}

let isCapturing = false;
let observer = null;

// Listen for messages from popup and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Website Copier: Received message:", request.action);
  
  if (request.action === "startCapture") {
    startCapture(request.mode || "full", request.settings || {}, request).then(result => {
      console.log("Website Copier: Capture result:", result);
      sendResponse(result);
    }).catch(error => {
      console.error("Website Copier: Capture error:", error);
      sendResponse({ error: error.message });
    });
    return true; // Keep channel open for async
  } else if (request.action === "createZip") {
    createZipFile(request.files, request.html).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (request.action === "createMultiPageZip") {
    createMultiPageZip(request.pages, request.files).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (request.action === "ping") {
    // Health check - respond immediately
    sendResponse({ status: "ok", timestamp: Date.now() });
    return true;
  } else if (request.action === "discoverLinks") {
    // Discover all internal links on current page
    const links = discoverInternalLinks();
    sendResponse({ links: links });
    return true;
  } else if (request.action === "capturePage") {
    // Capture current page for multi-page crawl
    capturePageForCrawl().then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  }
  
  // If no handler, return undefined (no response)
  return false;
});

// Log that content script is loaded
console.log("Website Copier: Content script loaded on", window.location.href);

/**
 * Start website capture process
 */
async function startCapture(mode = "full", settings = {}, request = {}) {
  if (isCapturing) {
    return { error: "Capture already in progress" };
  }
  
  isCapturing = true;
  
  try {
    // Wait for page to be fully loaded
    await waitForPageLoad();
    
    // Capture rendered HTML
    const html = captureRenderedHTML();
    
    // Discover all assets
    const assets = await discoverAssets(mode, settings);
    
    // Rewrite URLs in HTML for offline mode
    const rewrittenHtml = rewriteUrlsForOffline(html, assets);
    
    // Check if this is a multi-page crawl request
    const crawlPages = (mode === "full" && request.crawlPages !== false);
    
    // Send to background for download
    chrome.runtime.sendMessage({
      action: "startDownload",
      mode: mode,
      html: rewrittenHtml,
      assets: assets,
      settings: settings,
      crawlPages: crawlPages
    });
    
    return { success: true, assetCount: assets.length };
  } catch (error) {
    console.error("Capture error:", error);
    return { error: error.message };
  } finally {
    isCapturing = false;
  }
}

/**
 * Wait for page to be fully loaded including dynamic content
 */
async function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === "complete") {
      // Wait a bit more for dynamic content
      setTimeout(resolve, 2000);
    } else {
      window.addEventListener("load", () => {
        setTimeout(resolve, 2000);
      });
    }
    
    // Also trigger lazy-loaded images
    triggerLazyLoad();
  });
}

/**
 * Trigger lazy-loaded images by scrolling
 */
function triggerLazyLoad() {
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  
  if (scrollHeight > viewportHeight) {
    // Scroll to bottom to trigger lazy loading
    window.scrollTo(0, scrollHeight);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1000);
  }
}

/**
 * Capture rendered HTML (not source)
 */
function captureRenderedHTML() {
  // Clone the document to avoid modifying original
  const clone = document.documentElement.cloneNode(true);
  
  // Remove script tags that might cause issues
  const scripts = clone.querySelectorAll("script");
  scripts.forEach(script => {
    // Keep script content but mark as already executed
    if (script.src) {
      script.remove();
    } else {
      script.textContent = "// Script removed for offline compatibility";
    }
  });
  
  // Get HTML string
  return "<!DOCTYPE html>\n" + clone.outerHTML;
}

/**
 * Discover all assets on the page
 */
async function discoverAssets(mode, settings = {}) {
  // Get base URL and settings
  const baseUrl = window.location.origin;
  
  // Try to use AssetScanner if available, otherwise fall back to manual discovery
  if (typeof AssetScanner !== "undefined") {
    const scanner = new AssetScanner(baseUrl, settings);
    return scanner.scanAll();
  }
  
  // Fallback to manual discovery
  const assets = new Map(); // Use Map for deduplication by URL
  
  // Discover assets based on mode
  if (mode === "assets" || mode === "full") {
    // CSS files
    discoverCSSAssets(assets, baseUrl);
    
    // JavaScript files
    discoverJSAssets(assets, baseUrl);
    
    // Images
    discoverImageAssets(assets, baseUrl);
    
    // Fonts
    discoverFontAssets(assets, baseUrl);
    
    // Videos and media
    discoverMediaAssets(assets, baseUrl);
    
    // Background images from inline styles and CSS
    discoverBackgroundImages(assets, baseUrl);
  }
  
  // Convert Map to Array
  return Array.from(assets.values());
}

/**
 * Discover CSS assets
 */
function discoverCSSAssets(assets, baseUrl) {
  // <link rel="stylesheet">
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const href = link.getAttribute("href");
    if (href) {
      const url = resolveUrl(href, baseUrl);
      if (url && !assets.has(url)) {
        assets.set(url, {
          url: url,
          type: "css",
          localPath: getLocalPath(url, baseUrl, "css")
        });
      }
    }
  });
  
  // @import in style tags
  document.querySelectorAll("style").forEach(style => {
    const cssText = style.textContent;
    const importMatches = cssText.match(/@import\s+["']([^"']+)["']/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const urlMatch = match.match(/["']([^"']+)["']/);
        if (urlMatch) {
          const url = resolveUrl(urlMatch[1], baseUrl);
          if (url && !assets.has(url)) {
            assets.set(url, {
              url: url,
              type: "css",
              localPath: getLocalPath(url, baseUrl, "css")
            });
          }
        }
      });
    }
  });
}

/**
 * Discover JavaScript assets
 */
function discoverJSAssets(assets, baseUrl) {
  document.querySelectorAll('script[src]').forEach(script => {
    const src = script.getAttribute("src");
    if (src) {
      const url = resolveUrl(src, baseUrl);
      if (url && !assets.has(url)) {
        assets.set(url, {
          url: url,
          type: "js",
          localPath: getLocalPath(url, baseUrl, "js")
        });
      }
    }
  });
}

/**
 * Discover image assets
 */
function discoverImageAssets(assets, baseUrl) {
  // <img src>
  document.querySelectorAll("img").forEach(img => {
    const src = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("data-lazy-src");
    if (src) {
      const url = resolveUrl(src, baseUrl);
      if (url && !assets.has(url)) {
        assets.set(url, {
          url: url,
          type: "image",
          localPath: getLocalPath(url, baseUrl, "images")
        });
      }
    }
  });
  
  // <picture> sources
  document.querySelectorAll("picture source").forEach(source => {
    const srcset = source.getAttribute("srcset");
    if (srcset) {
      parseSrcSet(srcset, baseUrl).forEach(url => {
        if (!assets.has(url)) {
          assets.set(url, {
            url: url,
            type: "image",
            localPath: getLocalPath(url, baseUrl, "images")
          });
        }
      });
    }
  });
}

/**
 * Discover font assets
 */
function discoverFontAssets(assets, baseUrl) {
  // @font-face in style tags and CSS files
  document.querySelectorAll("style").forEach(style => {
    const cssText = style.textContent;
    const fontMatches = cssText.match(/url\(["']?([^"')]+)["']?\)/g);
    if (fontMatches) {
      fontMatches.forEach(match => {
        const urlMatch = match.match(/url\(["']?([^"')]+)["']?\)/);
        if (urlMatch) {
          const url = resolveUrl(urlMatch[1], baseUrl);
          if (url && isFontFile(url) && !assets.has(url)) {
            assets.set(url, {
              url: url,
              type: "font",
              localPath: getLocalPath(url, baseUrl, "fonts")
            });
          }
        }
      });
    }
  });
}

/**
 * Discover media assets (video, audio)
 */
function discoverMediaAssets(assets, baseUrl) {
  document.querySelectorAll("video source, audio source").forEach(source => {
    const src = source.getAttribute("src");
    if (src) {
      const url = resolveUrl(src, baseUrl);
      if (url && !assets.has(url)) {
        assets.set(url, {
          url: url,
          type: "media",
          localPath: getLocalPath(url, baseUrl, "media")
        });
      }
    }
  });
  
  // Video poster images
  document.querySelectorAll("video[poster]").forEach(video => {
    const poster = video.getAttribute("poster");
    if (poster) {
      const url = resolveUrl(poster, baseUrl);
      if (url && !assets.has(url)) {
        assets.set(url, {
          url: url,
          type: "image",
          localPath: getLocalPath(url, baseUrl, "images")
        });
      }
    }
  });
}

/**
 * Discover background images from inline styles
 */
function discoverBackgroundImages(assets, baseUrl) {
  const elements = document.querySelectorAll("*");
  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    const bgImage = style.backgroundImage;
    
    if (bgImage && bgImage !== "none") {
      const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
      if (urlMatch) {
        const url = resolveUrl(urlMatch[1], baseUrl);
        if (url && !assets.has(url)) {
          assets.set(url, {
            url: url,
            type: "image",
            localPath: getLocalPath(url, baseUrl, "images")
          });
        }
      }
    }
  });
}

/**
 * Resolve relative URL to absolute URL
 */
function resolveUrl(url, baseUrl) {
  try {
    // Remove data URLs and blob URLs
    if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("javascript:")) {
      return null;
    }
    
    // Resolve relative URLs
    return new URL(url, baseUrl).href;
  } catch (e) {
    return null;
  }
}

/**
 * Get local file path for asset
 */
function getLocalPath(url, baseUrl, defaultFolder) {
  try {
    const urlObj = new URL(url);
    const baseUrlObj = new URL(baseUrl);
    
    // If same origin, use relative path
    if (urlObj.origin === baseUrlObj.origin) {
      const path = urlObj.pathname;
      const filename = path.split("/").pop() || "file";
      const ext = getFileExtension(url);
      
      // Organize by type
      if (ext) {
        return `${defaultFolder}/${sanitizeFilename(filename)}`;
      }
      return `${defaultFolder}/${sanitizeFilename(filename)}${ext}`;
    } else {
      // External resource - put in external folder
      const domain = urlObj.hostname.replace(/[^a-z0-9]/gi, "_");
      const filename = urlObj.pathname.split("/").pop() || "file";
      const ext = getFileExtension(url);
      return `external/${domain}/${sanitizeFilename(filename)}${ext || ""}`;
    }
  } catch (e) {
    // Fallback
    const filename = url.split("/").pop() || "file";
    return `${defaultFolder}/${sanitizeFilename(filename)}`;
  }
}

/**
 * Get file extension from URL
 */
function getFileExtension(url) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-z0-9]+)$/i);
    return match ? `.${match[1]}` : "";
  } catch (e) {
    return "";
  }
}

/**
 * Check if URL is a font file
 */
function isFontFile(url) {
  const fontExtensions = [".woff", ".woff2", ".ttf", ".otf", ".eot"];
  return fontExtensions.some(ext => url.toLowerCase().includes(ext));
}

/**
 * Parse srcset attribute
 */
function parseSrcSet(srcset, baseUrl) {
  const urls = [];
  const parts = srcset.split(",");
  
  parts.forEach(part => {
    const url = part.trim().split(/\s+/)[0];
    if (url) {
      const resolved = resolveUrl(url, baseUrl);
      if (resolved) urls.push(resolved);
    }
  });
  
  return urls;
}

/**
 * Sanitize filename for filesystem
 */
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9._-]/gi, "_").substring(0, 200);
}

/**
 * Discover all internal links on the page
 */
function discoverInternalLinks() {
  const links = new Set();
  const baseUrl = window.location.origin;
  const baseUrlObj = new URL(baseUrl);
  
  // Find all <a> tags with href
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    try {
      // Skip hash links, javascript:, mailto:, etc.
      if (href.startsWith('#') || href.startsWith('javascript:') || 
          href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      // Resolve relative URLs
      const url = new URL(href, baseUrl);
      
      // Only same-domain links
      if (url.origin !== baseUrlObj.origin) {
        return;
      }
      
      // Remove hash and query params for clean URL
      const cleanUrl = url.origin + url.pathname;
      
      // Skip common non-page URLs
      const ignorePatterns = [
        /\.(pdf|zip|doc|docx|xls|xlsx|jpg|jpeg|png|gif|svg|css|js)$/i,
        /\/api\//i,
        /\/admin\//i,
        /\/login/i,
        /\/logout/i
      ];
      
      if (ignorePatterns.some(pattern => pattern.test(cleanUrl))) {
        return;
      }
      
      links.add(cleanUrl);
    } catch (e) {
      // Invalid URL, skip
    }
  });
  
  return Array.from(links);
}

/**
 * Capture page for multi-page crawl
 */
async function capturePageForCrawl() {
  try {
    // Wait for page to be fully loaded
    await waitForPageLoad();
    
    // Capture rendered HTML
    const html = captureRenderedHTML();
    
    // Discover all assets
    const assets = await discoverAssets("full", {});
    
    // Discover links on this page
    const links = discoverInternalLinks();
    
    // Rewrite URLs in HTML for offline mode
    const rewrittenHtml = rewriteUrlsForOffline(html, assets);
    
    return {
      success: true,
      html: rewrittenHtml,
      assets: assets,
      links: links,
      url: window.location.href
    };
  } catch (error) {
    console.error("Page capture error:", error);
    return { error: error.message };
  }
}

/**
 * Rewrite URLs in HTML for offline mode
 */
function rewriteUrlsForOffline(html, assets) {
  const baseUrl = window.location.origin;
  
  // Try to use URLRewriter if available
  if (typeof URLRewriter !== "undefined") {
    const urlMap = new Map();
    assets.forEach(asset => {
      urlMap.set(asset.url, asset.localPath);
    });
    const rewriter = new URLRewriter(baseUrl, urlMap);
    return rewriter.rewriteHTML(html);
  }
  
  // Fallback to manual rewriting
  let rewritten = html;
  
  // Create URL mapping
  const urlMap = new Map();
  assets.forEach(asset => {
    urlMap.set(asset.url, asset.localPath);
  });
  
  // Rewrite URLs in HTML
  urlMap.forEach((localPath, originalUrl) => {
    // Escape special regex characters
    const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedUrl, "g");
    rewritten = rewritten.replace(regex, localPath);
  });
  
  return rewritten;
}

/**
 * Create ZIP file with multiple pages
 */
async function createMultiPageZip(pages, files) {
  try {
    // JSZip should be loaded via manifest.json content_scripts
    if (typeof JSZip === "undefined") {
      console.log("JSZip not found in global scope, attempting to load from extension file...");
      try {
        await loadJSZip();
      } catch (loadError) {
        console.error("Failed to load JSZip:", loadError);
        throw new Error("JSZip library not available. Please ensure jszip.min.js is in the extension folder and reload the extension.");
      }
      
      if (typeof JSZip === "undefined") {
        throw new Error("JSZip file loaded but JSZip object not available. Please reload the extension.");
      }
    }
    
    console.log("JSZip is available, creating multi-page ZIP...");
    
    const zip = new JSZip();
    
    // Add all pages
    pages.forEach(({ path, html }) => {
      zip.file(path, html);
    });
    
    // Add all asset files
    let fileCount = 0;
    files.forEach(({ path, data }) => {
      if (data && Array.isArray(data)) {
        try {
          const uint8Array = new Uint8Array(data);
          zip.file(path, uint8Array);
          fileCount++;
        } catch (e) {
          console.warn(`Failed to add file ${path}:`, e);
        }
      }
    });
    
    console.log(`Creating ZIP with ${pages.length} pages and ${fileCount} files...`);
    
    // Generate ZIP as base64
    const zipBlob = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
    
    console.log(`ZIP created, size: ${zipBlob.size} bytes`);
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve({ zipData: base64 });
      };
      reader.onerror = () => reject(new Error("Failed to convert ZIP to base64"));
      reader.readAsDataURL(zipBlob);
    });
  } catch (error) {
    console.error("Multi-page ZIP creation error:", error);
    return { error: error.message || "Unknown error creating ZIP file" };
  }
}

/**
 * Create ZIP file using JSZip
 */
async function createZipFile(files, html) {
  try {
    // JSZip should be loaded via manifest.json content_scripts
    // If not available, try to load it from extension file
    if (typeof JSZip === "undefined") {
      console.log("JSZip not found in global scope, attempting to load from extension file...");
      try {
        await loadJSZip();
      } catch (loadError) {
        console.error("Failed to load JSZip:", loadError);
        throw new Error("JSZip library not available. Please ensure jszip.min.js is in the extension folder and reload the extension.");
      }
      
      // Double-check JSZip is loaded
      if (typeof JSZip === "undefined") {
        throw new Error("JSZip file loaded but JSZip object not available. Please reload the extension.");
      }
    }
    
    console.log("JSZip is available, creating ZIP...");
    
    const zip = new JSZip();
    
    // Add HTML file
    zip.file("index.html", html);
    
    // Add all asset files
    // Files come as array of {path, data} objects where data is Uint8Array array
    let fileCount = 0;
    files.forEach(({ path, data }) => {
      if (data && Array.isArray(data)) {
        try {
          // Convert array back to Uint8Array
          const uint8Array = new Uint8Array(data);
          zip.file(path, uint8Array);
          fileCount++;
        } catch (e) {
          console.warn(`Failed to add file ${path}:`, e);
        }
      }
    });
    
    console.log(`Creating ZIP with ${fileCount} files...`);
    
    // Generate ZIP as base64
    const zipBlob = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
    
    console.log(`ZIP created, size: ${zipBlob.size} bytes`);
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve({ zipData: base64 });
      };
      reader.onerror = () => reject(new Error("Failed to convert ZIP to base64"));
      reader.readAsDataURL(zipBlob);
    });
  } catch (error) {
    console.error("ZIP creation error:", error);
    return { error: error.message || "Unknown error creating ZIP file" };
  }
}

/**
 * Load JSZip library dynamically from extension local file
 * CDN loading is blocked by CSP, so we only use local file
 */
function loadJSZip() {
  return new Promise((resolve, reject) => {
    if (typeof JSZip !== "undefined") {
      console.log("JSZip already available");
      resolve();
      return;
    }
    
    // JSZip should be loaded via manifest.json content_scripts
    // But if it's not available, try loading from extension file
    console.log("JSZip not found, loading from extension file...");
    
    try {
      const localScript = document.createElement("script");
      localScript.src = chrome.runtime.getURL("jszip.min.js");
      
      localScript.onload = () => {
        console.log("JSZip script loaded, waiting for JSZip object...");
        // Wait for JSZip to be fully available (check multiple times)
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max
        const checkInterval = setInterval(() => {
          attempts++;
          if (typeof JSZip !== "undefined") {
            console.log("JSZip is now available!");
            clearInterval(checkInterval);
            resolve();
          } else if (attempts >= maxAttempts) {
            // Give up after max attempts
            clearInterval(checkInterval);
            reject(new Error("JSZip file loaded but JSZip object not found. The file may be corrupted. Please re-download jszip.min.js and reload the extension."));
          }
        }, 100);
      };
      
      localScript.onerror = (error) => {
        console.error("Failed to load JSZip file:", error);
        reject(new Error("Failed to load jszip.min.js from extension. Make sure the file exists in the extension folder and reload the extension."));
      };
      
      document.head.appendChild(localScript);
    } catch (e) {
      console.error("Error creating script tag:", e);
      reject(new Error("Failed to create script tag for JSZip. Please reload the extension."));
    }
  });
}

