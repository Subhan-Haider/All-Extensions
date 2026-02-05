// background.js

const RULE_ID_START = 1000;
const BLOCK_ALL_RULE_ID = 500;

const CATEGORY_MAP = {
  social: ['facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com', 'linkedin.com', 'reddit.com', 'pinterest.com', 'snapchat.com'],
  video: ['youtube.com', 'netflix.com', 'twitch.tv', 'hulu.com', 'disneyplus.com', 'vimeo.com', 'primevideo.com'],
  games: ['twitch.tv', 'steamcommunity.com', 'roblox.com', 'minecraft.net', 'epicgames.com', 'discord.com', 'igntv.com'],
  news: ['cnn.com', 'bbc.com', 'nytimes.com', 'foxnews.com', 'reuters.com', 'theguardian.com', 'wsj.com'],
  shopping: ['amazon.com', 'ebay.com', 'etsy.com', 'walmart.com', 'target.com', 'aliexpress.com', 'temu.com']
};

let focusTimerInterval = null;

// Initialize
async function initializeExtension() {
  try {
    const data = await chrome.storage.local.get(['blockedSites', 'blockedWords', 'categories', 'schedule', 'isFocusMode', 'strictMode', 'whitelistMode', 'totalLockdown', 'resolution', 'statistics', 'focusEndTime']);

    // Proper Statistics Object
    const defaultStats = {
      daily: {},
      topSites: {},
      focusMode: { sessions: 0, minutes: 0 }
    };

    await chrome.storage.local.set({
      blockedSites: data.blockedSites || [],
      blockedWords: data.blockedWords || [],
      categories: data.categories || { social: false, video: false, games: false, news: false, shopping: false },
      schedule: data.schedule || { enabled: false, intervals: [] },
      statistics: data.statistics || defaultStats,
      isFocusMode: data.isFocusMode || false,
      strictMode: data.strictMode || false,
      whitelistMode: data.whitelistMode || false,
      totalLockdown: data.totalLockdown || false,
      resolution: data.resolution || "REDIRECT"
    });

    await updateBlockingRules();

    // If browser was restarted during focus mode, resume tracking
    if (data.isFocusMode && data.focusEndTime > Date.now()) {
      startFocusTracking();
    }

    for (let i = 0; i < 5; i++) setTimeout(scanAndBlockExistingTabs, i * 2000);
  } catch (e) { console.error("Init error:", e); }
}

chrome.runtime.onInstalled.addListener(initializeExtension);
chrome.runtime.onStartup.addListener(initializeExtension);

// AGGRESSIVE TAB WATCHERS
chrome.tabs.onUpdated.addListener((id, change, tab) => { if (change.url) checkAndBlockTab(tab); });
chrome.tabs.onActivated.addListener(info => { chrome.tabs.get(info.tabId, tab => { if (tab) checkAndBlockTab(tab); }); });
chrome.webNavigation.onBeforeNavigate.addListener(d => { if (d.frameId === 0) checkAndBlockTab({ id: d.tabId, url: d.url }); });
chrome.webNavigation.onCommitted.addListener(d => { if (d.frameId === 0) checkAndBlockTab({ id: d.tabId, url: d.url }); });
chrome.webNavigation.onHistoryStateUpdated.addListener(d => { if (d.frameId === 0) checkAndBlockTab({ id: d.tabId, url: d.url }); });

// MESSAGE HANDLING
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handleMessage = async () => {
    if (request.action === "BLOCK_DOMAIN") return await addDomainToBlocklist(request.domain);
    if (request.action === "UNBLOCK_DOMAIN") return await removeDomainFromBlocklist(request.domain);
    if (request.action === "START_FOCUS") return await startFocusSession(request.durationMinutes);
    if (request.action === "STOP_FOCUS") return await stopFocusSession();
    if (request.action === "RECORD_BLOCK") {
      await recordBlockedAttempt(request.domain);
      return { success: true };
    }
    if (request.action === "SET_RESOLUTION" || request.action === "TOGGLE_STRICT_MODE" || request.action === "TOGGLE_LOCKDOWN" || request.action === "REFRESH_RULES") {
      if (request.resolution) await chrome.storage.local.set({ resolution: request.resolution });
      if (request.enabled !== undefined) {
        if (request.action === "TOGGLE_STRICT_MODE") await chrome.storage.local.set({ strictMode: request.enabled });
        if (request.action === "TOGGLE_LOCKDOWN") await chrome.storage.local.set({ totalLockdown: request.enabled });
      }
      await updateBlockingRules(); await scanAndBlockExistingTabs();
      return { success: true };
    }
  };
  handleMessage().then(sendResponse);
  return true;
});

async function recordBlockedAttempt(domain) {
  const { statistics = {} } = await chrome.storage.local.get('statistics');
  const today = new Date().toISOString().split('T')[0];

  if (!statistics.daily) statistics.daily = {};
  statistics.daily[today] = (statistics.daily[today] || 0) + 1;

  if (domain) {
    if (!statistics.topSites) statistics.topSites = {};
    statistics.topSites[domain] = (statistics.topSites[domain] || 0) + 1;
  }

  await chrome.storage.local.set({ statistics });
}

async function addDomainToBlocklist(domain) {
  const norm = domain.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
  const { blockedSites = [] } = await chrome.storage.local.get('blockedSites');
  if (!blockedSites.some(s => s.domain === norm)) {
    const list = [...blockedSites, { domain: norm, enabled: true, addedAt: Date.now() }];
    await chrome.storage.local.set({ blockedSites: list });
    await updateBlockingRules(); await scanAndBlockExistingTabs();
    return { success: true };
  }
  return { success: false };
}

async function removeDomainFromBlocklist(domain) {
  const { blockedSites } = await chrome.storage.local.get('blockedSites');
  await chrome.storage.local.set({ blockedSites: (blockedSites || []).filter(s => s.domain !== domain) });
  await updateBlockingRules(); return { success: true };
}

// 100% RELIABILITY RULE ENGINE
async function updateBlockingRules() {
  try {
    const data = await chrome.storage.local.get(['blockedSites', 'blockedWords', 'categories', 'schedule', 'isFocusMode', 'totalLockdown', 'whitelistMode', 'resolution']);
    const isScheduleActive = checkSchedule(data.schedule);
    const current = await chrome.declarativeNetRequest.getDynamicRules();

    let addRules = [];
    const action = data.resolution === "CLOSE" ? { type: "block" } : { type: "redirect", redirect: { extensionPath: "/blocked/blocked.html" } };
    const allResources = ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"];

    if (data.totalLockdown) {
      addRules.push({ id: BLOCK_ALL_RULE_ID, priority: 1000, action, condition: { urlFilter: "*", resourceTypes: allResources } });
    } else if (data.whitelistMode && (data.isFocusMode || isScheduleActive)) {
      addRules.push({ id: BLOCK_ALL_RULE_ID, priority: 100, action, condition: { urlFilter: "*", resourceTypes: allResources } });
      (data.blockedSites || []).forEach((s, i) => {
        if (s.enabled) addRules.push({ id: RULE_ID_START + i, priority: 500, action: { type: "allow" }, condition: { urlFilter: `||${s.domain}`, resourceTypes: allResources } });
      });
    } else {
      let sites = [...(data.blockedSites || []).filter(s => s.enabled).map(s => s.domain)];
      if (data.isFocusMode || isScheduleActive) {
        for (const [cat, enabled] of Object.entries(data.categories || {})) {
          if (enabled && CATEGORY_MAP[cat]) sites.push(...CATEGORY_MAP[cat]);
        }
        (data.blockedWords || []).forEach((w, i) => {
          if (w.enabled) addRules.push({ id: RULE_ID_START + 5000 + i, priority: 400, action, condition: { urlFilter: `*${w.word}*`, resourceTypes: allResources } });
        });
      }
      [...new Set(sites)].forEach((domain, i) => {
        if (domain) addRules.push({ id: RULE_ID_START + i, priority: 500, action, condition: { urlFilter: `||${domain}`, resourceTypes: allResources } });
      });
    }

    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: current.map(r => r.id), addRules });
  } catch (e) { console.error("DNR Error:", e); }
}

async function scanAndBlockExistingTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) await checkAndBlockTab(tab);
}

async function checkAndBlockTab(tab) {
  if (!tab || !tab.url || tab.url.startsWith('chrome') || tab.url.includes('blocked.html')) return;
  const data = await chrome.storage.local.get(['blockedSites', 'blockedWords', 'categories', 'isFocusMode', 'totalLockdown', 'whitelistMode', 'resolution', 'schedule']);
  const active = data.totalLockdown || data.isFocusMode || checkSchedule(data.schedule) || data.whitelistMode || (data.blockedSites || []).some(s => s.enabled);
  if (!active) return;

  let host = ''; try { host = new URL(tab.url).hostname.toLowerCase().replace(/^www\./, ''); } catch (e) { return; }
  let shouldBlock = false;
  if (data.totalLockdown) shouldBlock = true;
  else if (data.whitelistMode && (data.isFocusMode || checkSchedule(data.schedule))) shouldBlock = !(data.blockedSites || []).some(s => s.enabled && (host === s.domain || host.endsWith('.' + s.domain)));
  else {
    const custom = (data.blockedSites || []).some(s => s.enabled && (host === s.domain || host.endsWith('.' + s.domain)));
    let focus = (data.isFocusMode || checkSchedule(data.schedule)) && (
      (data.blockedWords || []).some(w => w.enabled && host.includes(w.word)) ||
      Object.entries(data.categories || {}).some(([cat, act]) => act && CATEGORY_MAP[cat]?.includes(host))
    );
    shouldBlock = custom || focus;
  }
  if (shouldBlock) {
    if (data.resolution === "CLOSE") chrome.tabs.remove(tab.id).catch(() => { });
    else chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("blocked/blocked.html") + "?blockedUrl=" + encodeURIComponent(tab.url) }).catch(() => { });
  }
}

function checkSchedule(s) {
  if (!s || !s.enabled || !s.intervals || !s.intervals.length) return false;
  const now = new Date(); const d = now.getDay(), t = now.getHours() * 60 + now.getMinutes();
  return s.intervals.some(i => {
    if (!i.days.includes(d)) return false;
    const [sh, sm] = i.startTime.split(':').map(Number), [eh, em] = i.endTime.split(':').map(Number);
    const start = sh * 60 + sm, end = eh * 60 + em;
    return (end < start) ? (t >= start || t < end) : (t >= start && t <= end);
  });
}

function startFocusTracking() {
  if (focusTimerInterval) clearInterval(focusTimerInterval);
  focusTimerInterval = setInterval(async () => {
    const data = await chrome.storage.local.get(['isFocusMode', 'focusEndTime', 'statistics']);
    if (data.isFocusMode && data.focusEndTime > Date.now()) {
      const stats = data.statistics || { daily: {}, topSites: {}, focusMode: { sessions: 0, minutes: 0 } };
      stats.focusMode.minutes = (stats.focusMode.minutes || 0) + 1;
      await chrome.storage.local.set({ statistics: stats });
    } else {
      clearInterval(focusTimerInterval);
    }
  }, 60000);
}

async function startFocusSession(m) {
  const end = Date.now() + (m * 60 * 1000);
  const { statistics } = await chrome.storage.local.get('statistics');
  if (statistics && statistics.focusMode) {
    statistics.focusMode.sessions = (statistics.focusMode.sessions || 0) + 1;
    await chrome.storage.local.set({ statistics });
  }

  await chrome.storage.local.set({ isFocusMode: true, focusEndTime: end });
  startFocusTracking();
  await updateBlockingRules(); await scanAndBlockExistingTabs();
  return { success: true, endTime: end };
}

async function stopFocusSession() {
  if (focusTimerInterval) clearInterval(focusTimerInterval);
  await chrome.storage.local.set({ isFocusMode: false, focusEndTime: null });
  await updateBlockingRules(); return { success: true };
}

initializeExtension();
