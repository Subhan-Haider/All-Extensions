// --- Background Service Worker ---

// 1. Context Menu for Research Clipper
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "clipToStudyStream",
        title: "Save to Research Vault",
        contexts: ["selection"]
    });

    // Initialize storage
    chrome.storage.local.get(['blockerEnabled'], (res) => {
        if (res.blockerEnabled === undefined) {
            chrome.storage.local.set({
                tasks: [],
                clippings: [],
                blockerEnabled: false,
                stats: { sessions: 0, minutes: 0 },
                notes: ""
            });
        } else {
            updateBlocker(res.blockerEnabled);
        }
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "clipToStudyStream") {
        chrome.storage.local.get(['clippings'], (result) => {
            const clippings = result.clippings || [];
            clippings.push({
                text: info.selectionText,
                source: new URL(tab.url).hostname,
                url: tab.url,
                timestamp: Date.now()
            });
            chrome.storage.local.set({ clippings });

            // Notify the user via content script if possible
            chrome.tabs.sendMessage(tab.id, { type: 'clipSuccess' });
        });
    }
});

// 2. Academic Shield (Site Blocker)
const distractingSites = [
    "*://*.youtube.com/*",
    "*://*.facebook.com/*",
    "*://*.twitter.com/*",
    "*://*.instagram.com/*",
    "*://*.netflix.com/*",
    "*://*.tiktok.com/*",
    "*://*.reddit.com/*"
];

function updateBlocker(enabled) {
    if (enabled) {
        const rules = distractingSites.map((url, index) => ({
            id: index + 1,
            priority: 1,
            action: { type: 'block' },
            condition: { urlFilter: url, resourceTypes: ['main_frame'] }
        }));

        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: distractingSites.map((_, i) => i + 1),
            addRules: rules
        });
    } else {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: distractingSites.map((_, i) => i + 1)
        });
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'toggleBlocker') {
        chrome.storage.local.set({ blockerEnabled: message.enabled });
        updateBlocker(message.enabled);
    }
});
