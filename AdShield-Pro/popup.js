// Popup functionality for AdShield Pro

let currentTab = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await applyTheme();
  await loadStats();
  await loadCurrentSite();
  setupEventListeners();
  checkExtensionStatus();
});

async function applyTheme() {
  const result = await chrome.storage.local.get(['lightThemeToggle']);
  if (result.lightThemeToggle) {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

// Listen for theme changes from settings
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.lightThemeToggle) {
    if (changes.lightThemeToggle.newValue) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }
});

// Load statistics from storage
async function loadStats() {
  try {
    const result = await chrome.storage.local.get(['stats']);
    const stats = result.stats || {
      adsBlocked: 0,
      trackersBlocked: 0,
      dataSaved: 0
    };

    updateStatsDisplay(stats);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Update stats display with animation
function updateStatsDisplay(stats) {
  animateValue('adsBlocked', 0, stats.adsBlocked, 1000);
  animateValue('trackersBlocked', 0, stats.trackersBlocked, 1000);

  const dataSavedMB = (stats.dataSaved / (1024 * 1024)).toFixed(2);
  document.getElementById('dataSaved').textContent = `${dataSavedMB} MB`;
}

// Animate number counting
function animateValue(id, start, end, duration) {
  const element = document.getElementById(id);
  if (!element) return;
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString();
  }, 16);
}

// Load current site information
async function loadCurrentSite() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    if (!tab || !tab.url) {
      document.getElementById('currentSite').textContent = 'No active site';
      return;
    }

    const url = new URL(tab.url);
    const hostname = url.hostname;

    document.getElementById('currentSite').textContent = hostname;

    // Check if site is whitelisted
    const result = await chrome.storage.local.get(['whitelist']);
    const whitelist = result.whitelist || [];
    const isWhitelisted = whitelist.includes(hostname);

    updateWhitelistButton(isWhitelisted);
    updateSiteStatus(isWhitelisted);
  } catch (error) {
    console.error('Error loading current site:', error);
    document.getElementById('currentSite').textContent = 'Error loading site';
  }
}

// Update whitelist button state
function updateWhitelistButton(isWhitelisted) {
  const btn = document.getElementById('whitelistBtn');
  if (!btn) return;
  if (isWhitelisted) {
    btn.classList.add('active');
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L2 4V7C2 10.59 4.92 13.92 8 14.5C11.08 13.92 14 10.59 14 7V4L8 1Z" fill="currentColor"/>
      </svg>
      Remove from Whitelist
    `;
  } else {
    btn.classList.remove('active');
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L2 4V7C2 10.59 4.92 13.92 8 14.5C11.08 13.92 14 10.59 14 7V4L8 1Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
      </svg>
      Whitelist Site
    `;
  }
}

// Update site status display
function updateSiteStatus(isWhitelisted) {
  const statusElement = document.getElementById('siteStatus');
  if (!statusElement) return;
  if (isWhitelisted) {
    statusElement.innerHTML = `
      <span class="status-dot whitelisted"></span>
      <span>Whitelisted</span>
    `;
  } else {
    statusElement.innerHTML = `
      <span class="status-dot protected"></span>
      <span>Protected</span>
    `;
  }
}

// Helper to safely reload a tab
async function safeReload(tabId) {
  if (!tabId) return;
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab) {
      await chrome.tabs.reload(tabId);
    }
  } catch (err) {
    console.log('AdShield Pro: Tab reload skipped (tab closed or untraceable)');
  }
}

// Setup event listeners
function setupEventListeners() {
  const extensionToggle = document.getElementById('extensionToggle');
  if (extensionToggle) {
    extensionToggle.addEventListener('change', async (e) => {
      const enabled = e.target.checked;
      await chrome.storage.local.set({ enabled });
      chrome.runtime.sendMessage({ action: 'toggleExtension', enabled }).catch(() => { });
      if (currentTab) safeReload(currentTab.id);
    });
  }

  const resetBtn = document.getElementById('resetStats');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('Reset all statistics?')) {
        await chrome.storage.local.set({ stats: { adsBlocked: 0, trackersBlocked: 0, dataSaved: 0, history: [] } });
        updateStatsDisplay({ adsBlocked: 0, trackersBlocked: 0, dataSaved: 0 });
      }
    });
  }

  const whitelistBtn = document.getElementById('whitelistBtn');
  if (whitelistBtn) {
    whitelistBtn.addEventListener('click', async () => {
      if (!currentTab || !currentTab.url) return;
      const url = new URL(currentTab.url);
      const hostname = url.hostname;
      const result = await chrome.storage.local.get(['whitelist']);
      let whitelist = result.whitelist || [];
      const index = whitelist.indexOf(hostname);
      if (index > -1) whitelist.splice(index, 1);
      else whitelist.push(hostname);
      await chrome.storage.local.set({ whitelist });
      updateWhitelistButton(whitelist.includes(hostname));
      updateSiteStatus(whitelist.includes(hostname));
      safeReload(currentTab.id);
    });
  }

  const pickerBtn = document.getElementById('pickerBtn');
  if (pickerBtn) {
    pickerBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'activatePicker' }).catch(() => { });
      window.close();
    });
  }

  const dashboardBtn = document.getElementById('dashboardBtn');
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'dashboard.html' });
    });
  }

  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'settings.html' });
    });
  }

  const filtersBtn = document.getElementById('filtersBtn');
  if (filtersBtn) {
    filtersBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'filters.html' });
    });
  }
}

// Check extension status
async function checkExtensionStatus() {
  const result = await chrome.storage.local.get(['enabled']);
  const enabled = result.enabled !== false;
  const toggle = document.getElementById('extensionToggle');
  if (toggle) toggle.checked = enabled;
}

// Listen for stats updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'statsUpdated') {
    loadStats();
  }
});
