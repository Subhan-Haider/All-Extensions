importScripts('discounts.js');

// 1. Initialize Alarm on Install
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('checkFlashDeals', { periodInMinutes: 5 });
    console.log('UniSaver: 5-minute flash deal check initialized.');
});

// 2. Alarm Listener
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkFlashDeals') {
        checkForFlashDeals();
    }
});

async function checkForFlashDeals() {
    // Simulate checking for a new flash deal from the database
    const randomIndex = Math.floor(Math.random() * studentDiscounts.length);
    const flashDeal = studentDiscounts[randomIndex];

    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '🔥 New Flash Deal!',
        message: `${flashDeal.name} is offering: ${flashDeal.offer}`,
        priority: 2
    });

    // Store last check time in storage
    chrome.storage.local.set({ lastCheck: new Date().toLocaleTimeString() });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        checkDiscount(tabId, tab.url);
    }
});

function checkDiscount(tabId, url) {
    try {
        const urlObj = new URL(url);
        const host = urlObj.hostname.replace('www.', '');

        const deal = studentDiscounts.find(d => host.includes(d.domain));

        if (deal) {
            // Set Badge
            chrome.action.setBadgeText({ text: '!', tabId: tabId });
            chrome.action.setBadgeBackgroundColor({ color: '#2563eb', tabId: tabId });

            // Notify Content Script to show toast
            chrome.tabs.sendMessage(tabId, { action: 'show_toast', deal: deal }).catch(err => {
                // Content script might not be loaded yet or on restricted page
            });
        } else {
            chrome.action.setBadgeText({ text: '', tabId: tabId });
        }
    } catch (e) {
        console.error(e);
    }
}
