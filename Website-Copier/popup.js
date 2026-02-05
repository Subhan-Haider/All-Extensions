/**
 * Popup Script
 * Handles UI interactions and progress updates
 */

let currentTab = null;
let isDownloading = false;
let progressInterval = null;

// Initialize popup
document.addEventListener("DOMContentLoaded", async () => {
  await initializePopup();
  setupEventListeners();
  startProgressListener();
});

/**
 * Initialize popup with current tab info
 */
async function initializePopup() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tabs[0];
    
    if (currentTab && currentTab.url) {
      document.getElementById("currentUrl").textContent = 
        currentTab.url.length > 50 
          ? currentTab.url.substring(0, 50) + "..." 
          : currentTab.url;
    }
  } catch (error) {
    console.error("Failed to get current tab:", error);
    document.getElementById("currentUrl").textContent = "Unable to get URL";
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Copy button
  document.getElementById("copyBtn").addEventListener("click", handleCopyClick);
  
  // Stop button
  document.getElementById("stopBtn").addEventListener("click", handleStopClick);
  
  // Clear logs button
  document.getElementById("clearLogsBtn").addEventListener("click", clearLogs);
  
  // Test offline button
  document.getElementById("testOfflineBtn").addEventListener("click", (e) => {
    e.preventDefault();
    showHelp("To test offline mode, download the website and open the index.html file in your browser.");
  });
  
  // Help button
  document.getElementById("helpBtn").addEventListener("click", (e) => {
    e.preventDefault();
    showHelp();
  });
}

/**
 * Handle copy button click
 */
async function handleCopyClick() {
  if (isDownloading) {
    return;
  }
  
  if (!currentTab) {
    showError("Unable to access current tab");
    return;
  }
  
  // Get selected mode
  const mode = document.querySelector('input[name="mode"]:checked').value;
  
  // Get settings
  const settings = getSettings();
  
  // For "full" mode, enable multi-page crawling
  const crawlPages = mode === "full";
  
  // Disable button and show progress
  isDownloading = true;
  document.getElementById("copyBtn").disabled = true;
  document.getElementById("stopBtn").style.display = "block";
  document.getElementById("progressSection").style.display = "block";
  
  // Reset progress
  resetProgress();
  addLog("Starting website capture...", "info");
  
  try {
    // Check if tab is a valid web page
    if (!currentTab.url || currentTab.url.startsWith("chrome://") || 
        currentTab.url.startsWith("edge://") || currentTab.url.startsWith("about:") ||
        currentTab.url.startsWith("chrome-extension://") || currentTab.url.startsWith("moz-extension://")) {
      throw new Error("Cannot copy this page. Please navigate to a regular website (http:// or https://).");
    }
    
    // First, try a ping to see if content script is already available
    let contentScriptReady = false;
    try {
      const pingResponse = await chrome.tabs.sendMessage(currentTab.id, { action: "ping" });
      if (pingResponse && pingResponse.status === "ok") {
        contentScriptReady = true;
        addLog("Content script is ready", "info");
      }
    } catch (pingError) {
      // Content script not available, need to inject
      console.log("Content script not available, injecting...");
    }
    
    // If content script is not ready, try to inject it
    if (!contentScriptReady) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          files: ['jszip.min.js', 'content.js']
        });
        addLog("Content script injected", "info");
        // Wait for content script to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (injectError) {
        console.error("Failed to inject content script:", injectError);
        throw new Error(`Cannot inject content script: ${injectError.message}. Please refresh the page and try again.`);
      }
    }
    
    // Try sending message with retry logic
    let response = null;
    let lastError = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await chrome.tabs.sendMessage(currentTab.id, {
          action: "startCapture",
          mode: mode,
          settings: settings,
          crawlPages: crawlPages
        });
        break; // Success, exit retry loop
      } catch (msgError) {
        lastError = msgError;
        if (attempt < 2) {
          addLog(`Retrying connection... (${attempt + 1}/3)`, "info");
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    if (!response && lastError) {
      throw lastError;
    }
    
    if (!response) {
      throw new Error("No response from content script. Please refresh the page and try again.");
    }
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    addLog(`Found ${response.assetCount || 0} assets to download`, "success");
  } catch (error) {
    console.error("Capture error:", error);
    
    // Provide more helpful error messages
    let errorMessage = error.message;
    if (error.message.includes("Receiving end does not exist")) {
      errorMessage = "Content script not available. Please refresh the page and try again.";
    } else if (error.message.includes("Could not establish connection")) {
      errorMessage = "Cannot connect to page. Make sure you're on a regular website and refresh the page.";
    }
    
    showError(`Failed to start capture: ${errorMessage}`);
    resetUI();
  }
}

/**
 * Handle stop button click
 */
async function handleStopClick() {
  try {
    await chrome.runtime.sendMessage({ action: "cancelDownload" });
    addLog("Download cancelled by user", "warning");
    resetUI();
  } catch (error) {
    console.error("Cancel error:", error);
  }
}

/**
 * Start listening for progress updates
 */
function startProgressListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "progressUpdate") {
      updateProgress(message.progress);
    } else if (message.action === "error") {
      showError(message.message);
      resetUI();
    } else if (message.action === "log") {
      addLog(message.text, message.type || "info");
    }
  });
  
  // Also poll for progress (fallback)
  progressInterval = setInterval(async () => {
    if (isDownloading) {
      try {
        const response = await chrome.runtime.sendMessage({ action: "getProgress" });
        if (response && response.progress) {
          updateProgress(response.progress);
        }
      } catch (error) {
        // Ignore errors
      }
    }
  }, 500);
}

/**
 * Update progress display
 */
function updateProgress(progress) {
  if (!progress) return;
  
  const total = progress.total || 1;
  const downloaded = progress.downloaded || 0;
  const failed = progress.failed || 0;
  const skipped = progress.skipped || 0;
  const size = progress.size || 0;
  const startTime = progress.startTime || Date.now();
  
  // Calculate percentage
  const percentage = Math.round((downloaded / total) * 100);
  
  // Update progress bar
  document.getElementById("progressFill").style.width = `${percentage}%`;
  document.getElementById("progressText").textContent = `${percentage}%`;
  
  // Update stats
  document.getElementById("downloadedCount").textContent = downloaded;
  document.getElementById("totalCount").textContent = total;
  document.getElementById("sizeValue").textContent = formatBytes(size);
  document.getElementById("failedCount").textContent = failed;
  
  // Update pages stat if available
  if (progress.pagesCrawled !== undefined) {
    document.getElementById("pagesStat").style.display = "block";
    document.getElementById("pagesCrawled").textContent = progress.pagesCrawled || 0;
    document.getElementById("pagesTotal").textContent = progress.pagesTotal || 0;
  }
  
  // Update time
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("timeValue").textContent = `${elapsed}s`;
  
  // Update status badge
  const statusBadge = document.getElementById("statusBadge");
  if (progress.completed) {
    statusBadge.textContent = "🟢 Completed";
    statusBadge.className = "status-badge success";
    addLog("ZIP file created successfully!", "success");
    resetUI();
  } else if (failed > 0 && downloaded + failed >= total) {
    statusBadge.textContent = "🔴 Completed with errors";
    statusBadge.className = "status-badge error";
  } else {
    statusBadge.textContent = "🟡 Processing";
    statusBadge.className = "status-badge";
  }
}

/**
 * Reset progress display
 */
function resetProgress() {
  document.getElementById("progressFill").style.width = "0%";
  document.getElementById("progressText").textContent = "0%";
  document.getElementById("downloadedCount").textContent = "0";
  document.getElementById("totalCount").textContent = "0";
  document.getElementById("sizeValue").textContent = "0 MB";
  document.getElementById("timeValue").textContent = "0s";
  document.getElementById("failedCount").textContent = "0";
  document.getElementById("statusBadge").textContent = "🟡 Processing";
  document.getElementById("statusBadge").className = "status-badge";
  clearLogs();
}

/**
 * Reset UI to initial state
 */
function resetUI() {
  isDownloading = false;
  document.getElementById("copyBtn").disabled = false;
  document.getElementById("stopBtn").style.display = "none";
}

/**
 * Add log entry
 */
function addLog(text, type = "info") {
  const logsContent = document.getElementById("logsContent");
  const logItem = document.createElement("div");
  logItem.className = `log-item ${type}`;
  logItem.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logsContent.appendChild(logItem);
  
  // Auto-scroll to bottom
  logsContent.scrollTop = logsContent.scrollHeight;
  
  // Limit log entries
  while (logsContent.children.length > 100) {
    logsContent.removeChild(logsContent.firstChild);
  }
}

/**
 * Clear logs
 */
function clearLogs() {
  const logsContent = document.getElementById("logsContent");
  logsContent.innerHTML = '<div class="log-item info">Ready to start...</div>';
}

/**
 * Show error message
 */
function showError(message) {
  addLog(`Error: ${message}`, "error");
  const statusBadge = document.getElementById("statusBadge");
  statusBadge.textContent = "🔴 Error";
  statusBadge.className = "status-badge error";
}

/**
 * Show help message
 */
function showHelp(message) {
  const helpText = message || `
    <strong>Website Copier Help</strong><br><br>
    <strong>Modes:</strong><br>
    • Full Website: Downloads all assets and HTML<br>
    • Current Page Only: Downloads only the current page<br>
    • Assets Only: Downloads assets without HTML<br><br>
    <strong>Usage:</strong><br>
    1. Navigate to the website you want to copy<br>
    2. Click "Copy Website" button<br>
    3. Wait for download to complete<br>
    4. Open the ZIP file and extract it<br>
    5. Open index.html in your browser<br><br>
    <strong>Note:</strong> Some websites may have CORS restrictions that prevent downloading certain assets.
  `;
  
  alert(helpText);
}

/**
 * Get settings from UI
 */
function getSettings() {
  return {
    maxFileSize: parseInt(document.getElementById("maxFileSize").value) * 1024 * 1024,
    maxConcurrency: parseInt(document.getElementById("maxConcurrency").value),
    ignoreExternal: document.getElementById("ignoreExternal").checked,
    ignoreAnalytics: document.getElementById("ignoreAnalytics").checked,
    maxDepth: parseInt(document.getElementById("maxDepth").value) || 2,
    maxPages: parseInt(document.getElementById("maxPages").value) || 50
  };
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

