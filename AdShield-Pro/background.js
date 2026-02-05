// Background service worker for AdShield Pro

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
    console.log('AdShield Pro installed');

    // Initialize storage
    const result = await chrome.storage.local.get(['stats']);
    if (!result.stats) {
        await chrome.storage.local.set({
            enabled: true,
            stats: {
                adsBlocked: 0,
                trackersBlocked: 0,
                dataSaved: 0,
                history: [] // Added for Analytics Dashboard
            },
            whitelist: [],
            customFilters: [],
            cosmeticRules: {}, // { hostname: [selectors] }
            stealthMode: true
        });
    }

    // Set up declarative net request rules
    await updateDynamicRules();
});

// Listen for web requests to track blocked items
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
    updateStats(details);
});

// Update statistics
async function updateStats(details) {
    try {
        const result = await chrome.storage.local.get(['stats', 'enabled']);

        if (result.enabled === false) return;

        const stats = result.stats || {
            adsBlocked: 0,
            trackersBlocked: 0,
            dataSaved: 0
        };

        // Determine type of block
        if (details.request.url.match(/ad|banner|popup|tracking|analytics/i)) {
            if (details.request.url.match(/tracking|analytics/i)) {
                stats.trackersBlocked++;
            } else {
                stats.adsBlocked++;
            }

            // Estimate data saved (average ad size ~50KB)
            stats.dataSaved += 50 * 1024;
        }

        await chrome.storage.local.set({ stats });

        // Notify popup of stats update (ignoring errors if popup is closed)
        chrome.runtime.sendMessage({ action: 'statsUpdated' }).catch(() => {
            // This error is expected when the popup is closed
        });
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Update dynamic rules based on whitelist
async function updateDynamicRules() {
    try {
        const result = await chrome.storage.local.get(['whitelist', 'customFilters']);
        const whitelist = result.whitelist || [];
        const customFilters = result.customFilters || [];

        // Remove all existing dynamic rules
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const ruleIdsToRemove = existingRules.map(rule => rule.id);

        if (ruleIdsToRemove.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ruleIdsToRemove
            });
        }

        // Add whitelist rules
        const whitelistRules = whitelist.map((domain, index) => ({
            id: index + 1,
            priority: 2,
            action: { type: 'allow' },
            condition: {
                urlFilter: `*://${domain}/*`,
                resourceTypes: ['main_frame', 'sub_frame', 'script', 'image', 'stylesheet']
            }
        }));

        // Add custom filter rules
        const customRules = customFilters.map((filter, index) => ({
            id: whitelist.length + index + 1,
            priority: 1,
            action: { type: 'block' },
            condition: {
                urlFilter: filter,
                resourceTypes: ['script', 'image', 'stylesheet', 'xmlhttprequest']
            }
        }));

        const allRules = [...whitelistRules, ...customRules];

        if (allRules.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: allRules
            });
        }
    } catch (error) {
        console.error('Error updating dynamic rules:', error);
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'toggleExtension') {
        handleToggleExtension(message.enabled);
    } else if (message.action === 'updateRules') {
        updateDynamicRules();
    } else if (message.action === 'activatePicker') {
        // Inject picker scripts into the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['picker.js']
            });
        }
    } else if (message.action === 'saveCustomRule') {
        const { hostname, rule } = message;
        const result = await chrome.storage.local.get(['cosmeticRules']);
        const cosmeticRules = result.cosmeticRules || {};

        if (!cosmeticRules[hostname]) cosmeticRules[hostname] = [];
        if (!cosmeticRules[hostname].includes(rule)) {
            cosmeticRules[hostname].push(rule);
            await chrome.storage.local.set({ cosmeticRules });
        }
    }
});

// Handle extension toggle
async function handleToggleExtension(enabled) {
    await chrome.storage.local.set({ enabled });

    if (enabled) {
        await updateDynamicRules();
    } else {
        // Disable all dynamic rules
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const ruleIdsToRemove = existingRules.map(rule => rule.id);

        if (ruleIdsToRemove.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ruleIdsToRemove
            });
        }
    }
}

// Listen for tab updates to check whitelist
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
        try {
            const url = new URL(tab.url);
            const hostname = url.hostname;

            const result = await chrome.storage.local.get(['whitelist', 'enabled']);
            const whitelist = result.whitelist || [];
            const enabled = result.enabled !== false;

            if (!enabled || whitelist.includes(hostname)) {
                // Site is whitelisted or extension is disabled
                return;
            }

            // Update badge to show protection status
            chrome.action.setBadgeText({ text: '✓', tabId });
            chrome.action.setBadgeBackgroundColor({ color: '#667eea', tabId });
        } catch (error) {
            console.error('Error checking whitelist:', error);
        }
    }
});

// Context menu for quick whitelist
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'whitelist-site',
        title: 'Whitelist this site',
        contexts: ['page']
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'whitelist-site' && tab.url) {
        const url = new URL(tab.url);
        const hostname = url.hostname;

        const result = await chrome.storage.local.get(['whitelist']);
        let whitelist = result.whitelist || [];

        if (!whitelist.includes(hostname)) {
            whitelist.push(hostname);
            await chrome.storage.local.set({ whitelist });
            await updateDynamicRules();

            // Reload the tab
            chrome.tabs.reload(tab.id);
        }
    }
});
