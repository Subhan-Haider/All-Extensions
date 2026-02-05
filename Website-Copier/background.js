/**
 * Background Service Worker
 * Manages download tasks, queue processing, and error retry logic
 */

// Task queue for managing downloads
let downloadQueue = [];
let isProcessing = false;
let currentTask = null;

// Initialize context menu on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copy-website",
    title: "Copy This Website",
    contexts: ["page", "frame"]
  });
  
  chrome.contextMenus.create({
    id: "copy-page-only",
    title: "Copy This Page Only",
    contexts: ["page", "frame"]
  });
  
  chrome.contextMenus.create({
    id: "copy-assets-only",
    title: "Copy Assets Only",
    contexts: ["page", "frame"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copy-website") {
    chrome.tabs.sendMessage(tab.id, { action: "startCapture", mode: "full" });
  } else if (info.menuItemId === "copy-page-only") {
    chrome.tabs.sendMessage(tab.id, { action: "startCapture", mode: "page" });
  } else if (info.menuItemId === "copy-assets-only") {
    chrome.tabs.sendMessage(tab.id, { action: "startCapture", mode: "assets" });
  }
});

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startDownload") {
    if (request.mode === "full" && request.crawlPages) {
      // Multi-page crawl
      startMultiPageCrawl(request, sender.tab).then(() => {
        sendResponse({ status: "started" });
      }).catch(error => {
        sendResponse({ status: "error", error: error.message });
      });
    } else {
      // Single page download
      handleDownloadRequest(request, sender.tab);
      sendResponse({ status: "started" });
    }
    return true;
  } else if (request.action === "getProgress") {
    sendResponse({ 
      progress: currentTask?.progress || {},
      isProcessing 
    });
  } else if (request.action === "cancelDownload") {
    cancelCurrentDownload();
    sendResponse({ status: "cancelled" });
  }
  
  return true; // Keep message channel open for async responses
});

/**
 * Handle download request from content script
 */
async function handleDownloadRequest(request, tab) {
  try {
    currentTask = {
      tabId: tab.id,
      url: tab.url,
      mode: request.mode || "full",
      assets: request.assets || [],
      html: request.html || "",
      progress: {
        total: 0,
        downloaded: 0,
        failed: 0,
        skipped: 0,
        size: 0,
        startTime: Date.now()
      },
      files: new Map(),
      cancelled: false
    };
    
    currentTask.progress.total = currentTask.assets.length;
    
    // Notify popup of start
    broadcastProgress();
    
    // Process downloads with concurrency limit
    await processDownloads(currentTask);
    
    if (!currentTask.cancelled) {
      // Build ZIP file
      await buildZipFile(currentTask);
    }
  } catch (error) {
    console.error("Download error:", error);
    broadcastError(error.message);
  }
}

/**
 * Process downloads with concurrency control
 */
async function processDownloads(task) {
  const CONCURRENCY = 5; // Max parallel downloads
  const chunks = [];
  
  for (let i = 0; i < task.assets.length; i += CONCURRENCY) {
    if (task.cancelled) break;
    
    const chunk = task.assets.slice(i, i + CONCURRENCY);
    chunks.push(chunk);
  }
  
  for (const chunk of chunks) {
    if (task.cancelled) break;
    
    await Promise.allSettled(
      chunk.map(asset => downloadAsset(asset, task))
    );
  }
}

/**
 * Download a single asset
 */
async function downloadAsset(asset, task) {
  if (task.cancelled) return;
  
  try {
    // Skip if already downloaded (deduplication)
    if (task.files.has(asset.localPath)) {
      task.progress.skipped++;
      broadcastProgress();
      return;
    }
    
    const response = await fetch(asset.url, {
      method: "GET",
      credentials: "include"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    // Check file size limit (50MB default)
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
      task.progress.skipped++;
      broadcastProgress();
      return;
    }
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    
    task.files.set(asset.localPath, arrayBuffer);
    task.progress.downloaded++;
    task.progress.size += arrayBuffer.byteLength;
    
    broadcastProgress();
  } catch (error) {
    console.error(`Failed to download ${asset.url}:`, error);
    task.progress.failed++;
    broadcastProgress();
  }
}

/**
 * Build ZIP file from downloaded assets
 */
async function buildZipFile(task) {
  if (task.cancelled) return;
  
  try {
    // Send message to content script to create ZIP (it has JSZip loaded)
    chrome.tabs.sendMessage(task.tabId, {
      action: "createZip",
      files: Array.from(task.files.entries()).map(([path, data]) => ({
        path: path,
        data: Array.from(new Uint8Array(data)) // Convert ArrayBuffer to array for message passing
      })),
      html: task.html
    }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error("ZIP creation error:", chrome.runtime.lastError);
        broadcastError(chrome.runtime.lastError.message);
        return;
      }
      
      if (response.error) {
        console.error("ZIP creation error:", response.error);
        broadcastError(response.error);
        return;
      }
      
      try {
        // Generate filename
        const url = new URL(task.url);
        const domain = url.hostname.replace(/[^a-z0-9]/gi, "_");
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${domain}_${timestamp}.zip`;
        
        // Convert base64 to data URL (service workers don't have URL.createObjectURL)
        const dataUrl = `data:application/zip;base64,${response.zipData}`;
        
        // Download ZIP file using data URL
        chrome.downloads.download({
          url: dataUrl,
          filename: filename,
          saveAs: true
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error("Download error:", chrome.runtime.lastError);
            broadcastError(chrome.runtime.lastError.message);
          } else {
            task.progress.completed = true;
            broadcastProgress();
          }
        });
      } catch (error) {
        console.error("Download setup error:", error);
        broadcastError(error.message);
      }
    });
  } catch (error) {
    console.error("ZIP creation error:", error);
    broadcastError(error.message);
  }
}

/**
 * Start multi-page crawl
 */
async function startMultiPageCrawl(request, initialTab) {
  const settings = request.settings || {};
  const maxDepth = settings.maxDepth || 2;
  const maxPages = settings.maxPages || 50;
  
  currentTask = {
    tabId: initialTab.id,
    url: initialTab.url,
    mode: "full",
    pages: new Map(), // url -> { html, assets, path }
    allAssets: new Map(), // Deduplicated assets across all pages
    visitedUrls: new Set(),
    pagesToVisit: [],
    progress: {
      total: 0,
      downloaded: 0,
      failed: 0,
      skipped: 0,
      size: 0,
      pagesCrawled: 0,
      pagesTotal: 0,
      startTime: Date.now()
    },
    files: new Map(),
    cancelled: false
  };
  
  try {
    // Start with initial page
    const baseUrl = new URL(initialTab.url);
    currentTask.visitedUrls.add(baseUrl.origin + baseUrl.pathname);
    
    // Capture initial page
    addLog("Crawling page 1: " + initialTab.url);
    await crawlPage(initialTab.id, initialTab.url, 0, maxDepth, maxPages);
    
    // Process all downloads
    currentTask.progress.total = currentTask.allAssets.size;
    broadcastProgress();
    await processDownloads({
      ...currentTask,
      assets: Array.from(currentTask.allAssets.values())
    });
    
    if (!currentTask.cancelled) {
      // Build ZIP with all pages
      await buildMultiPageZip(currentTask);
    }
  } catch (error) {
    console.error("Multi-page crawl error:", error);
    broadcastError(error.message);
  }
}

/**
 * Crawl a single page
 */
async function crawlPage(tabId, url, depth, maxDepth, maxPages) {
  if (currentTask.cancelled) return;
  if (depth > maxDepth) return;
  if (currentTask.pages.size >= maxPages) return;
  
  const urlObj = new URL(url);
  const cleanUrl = urlObj.origin + urlObj.pathname;
  
  if (currentTask.visitedUrls.has(cleanUrl)) {
    return; // Already visited
  }
  
  currentTask.visitedUrls.add(cleanUrl);
  
  try {
    // Navigate to page (or use existing tab if same)
    let targetTabId = tabId;
    if (url !== (await chrome.tabs.get(tabId)).url) {
      // Need to navigate
      await chrome.tabs.update(tabId, { url: url });
      // Wait for page to load
      await new Promise(resolve => {
        chrome.tabs.onUpdated.addListener(function listener(updatedTabId, info) {
          if (updatedTabId === tabId && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            setTimeout(resolve, 2000); // Wait for dynamic content
          }
        });
      });
    }
    
    // Inject content script and capture page
    await chrome.scripting.executeScript({
      target: { tabId: targetTabId },
      files: ['jszip.min.js', 'content.js']
    });
    
    // Wait a bit for script to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Send message to capture page
    const response = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(targetTabId, { action: "capturePage" }, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    // Store page data
    const pagePath = getPagePath(url, currentTask.url);
    currentTask.pages.set(cleanUrl, {
      html: response.html,
      assets: response.assets,
      path: pagePath,
      url: url
    });
    
    // Merge assets (deduplicated)
    response.assets.forEach(asset => {
      if (!currentTask.allAssets.has(asset.url)) {
        currentTask.allAssets.set(asset.url, asset);
      }
    });
    
    currentTask.progress.pagesCrawled++;
    currentTask.progress.pagesTotal = currentTask.pages.size;
    broadcastProgress();
    addLog(`Crawled page ${currentTask.progress.pagesCrawled}: ${url}`);
    
    // If not at max depth, crawl discovered links
    if (depth < maxDepth && response.links) {
      for (const link of response.links) {
        if (currentTask.pages.size >= maxPages) break;
        if (currentTask.cancelled) break;
        
        const linkUrl = link.startsWith('http') ? link : new URL(link, url).href;
        await crawlPage(targetTabId, linkUrl, depth + 1, maxDepth, maxPages);
      }
    }
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
    currentTask.progress.failed++;
    broadcastProgress();
  }
}

/**
 * Get file path for a page
 */
function getPagePath(pageUrl, baseUrl) {
  try {
    const pageUrlObj = new URL(pageUrl);
    const baseUrlObj = new URL(baseUrl);
    
    if (pageUrlObj.origin !== baseUrlObj.origin) {
      const domain = pageUrlObj.hostname.replace(/[^a-z0-9]/gi, '_');
      const path = pageUrlObj.pathname || '/index.html';
      const filename = path === '/' || path.endsWith('/') 
        ? 'index.html' 
        : path.split('/').pop() || 'index.html';
      return `pages/external/${domain}/${filename}`;
    }
    
    let path = pageUrlObj.pathname;
    if (path === '/' || path === '') {
      return 'index.html';
    }
    
    if (!path.match(/\.(html|htm)$/i)) {
      if (path.endsWith('/')) {
        path = path + 'index.html';
      } else {
        path = path + '.html';
      }
    }
    
    path = path.replace(/^\//, '');
    return `pages/${path}`;
  } catch (e) {
    return `pages/page_${Date.now()}.html`;
  }
}

/**
 * Build ZIP file with multiple pages
 */
async function buildMultiPageZip(task) {
  if (task.cancelled) return;
  
  try {
    // Send message to content script to create ZIP with all pages
    chrome.tabs.sendMessage(task.tabId, {
      action: "createMultiPageZip",
      pages: Array.from(task.pages.entries()).map(([url, data]) => ({
        path: data.path,
        html: data.html
      })),
      files: Array.from(task.files.entries()).map(([path, data]) => ({
        path: path,
        data: Array.from(new Uint8Array(data))
      }))
    }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error("ZIP creation error:", chrome.runtime.lastError);
        broadcastError(chrome.runtime.lastError.message);
        return;
      }
      
      if (response.error) {
        console.error("ZIP creation error:", response.error);
        broadcastError(response.error);
        return;
      }
      
      try {
        // Generate filename
        const url = new URL(task.url);
        const domain = url.hostname.replace(/[^a-z0-9]/gi, "_");
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${domain}_full_${timestamp}.zip`;
        
        // Convert base64 to data URL
        const dataUrl = `data:application/zip;base64,${response.zipData}`;
        
        // Download ZIP file
        chrome.downloads.download({
          url: dataUrl,
          filename: filename,
          saveAs: true
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error("Download error:", chrome.runtime.lastError);
            broadcastError(chrome.runtime.lastError.message);
          } else {
            task.progress.completed = true;
            broadcastProgress();
          }
        });
      } catch (error) {
        console.error("Download setup error:", error);
        broadcastError(error.message);
      }
    });
  } catch (error) {
    console.error("ZIP creation error:", error);
    broadcastError(error.message);
  }
}

/**
 * Add log message
 */
function addLog(message) {
  chrome.runtime.sendMessage({
    action: "log",
    text: message,
    type: "info"
  }).catch(() => {});
}

/**
 * Cancel current download
 */
function cancelCurrentDownload() {
  if (currentTask) {
    currentTask.cancelled = true;
    currentTask = null;
  }
}

/**
 * Broadcast progress to popup
 */
function broadcastProgress() {
  if (currentTask) {
    chrome.runtime.sendMessage({
      action: "progressUpdate",
      progress: currentTask.progress
    }).catch(() => {
      // Popup might be closed, ignore error
    });
  }
}

/**
 * Broadcast error message
 */
function broadcastError(message) {
  chrome.runtime.sendMessage({
    action: "error",
    message: message
  }).catch(() => {
    // Popup might be closed, ignore error
  });
}

