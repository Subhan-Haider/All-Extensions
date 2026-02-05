// --- StealthStudy Background Service Worker ---

chrome.commands.onCommand.addListener((command) => {
    if (command === "panic-button") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                // Send message to the active tab to redirect
                chrome.tabs.sendMessage(tabs[0].id, { action: 'panic' }, () => {
                    if (chrome.runtime.lastError) {
                        // If failed (e.g. on chrome:// pages), redirect via background as fallback
                        chrome.tabs.update(tabs[0].id, { url: "https://www.google.com/search?q=educational+resources" });
                    }
                });

                // Alternatively, update the tab URL directly from background
                // chrome.tabs.update(tabs[0].id, { url: "https://classroom.google.com" });
            }
        });
    } else if (command === "toggle-ghost") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleGhost' }, () => {
                    if (chrome.runtime.lastError) {
                        console.log("Toggle ghost failed on this page.");
                    }
                });
            }
        });
    }
});

// Set default settings on installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        antiDetection: true,
        bypassRestrictions: true,
        tabCloak: false,
        cloakTitle: "Google Docs",
        notes: ""
    });
});
