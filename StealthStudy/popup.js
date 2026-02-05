// --- StealthStudy Popup Logic ---

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        antiDetection: document.getElementById('antiDetection'),
        bypassRestrictions: document.getElementById('bypassRestrictions'),
        tabCloak: document.getElementById('tabCloak'),
        cloakTitle: document.getElementById('cloakTitle'),
        notes: document.getElementById('notes'),
        saveBtn: document.getElementById('saveNotes'),
        status: document.getElementById('status'),
        toggleGhostBtn: document.getElementById('toggleGhost'),
        toggleSearchBtn: document.getElementById('toggleSearch'),
        clearDataBtn: document.getElementById('clearData')
    };

    // Load saved settings
    chrome.storage.local.get([
        'antiDetection',
        'bypassRestrictions',
        'tabCloak',
        'cloakTitle',
        'notes'
    ], (data) => {
        elements.antiDetection.checked = !!data.antiDetection;
        elements.bypassRestrictions.checked = !!data.bypassRestrictions;
        elements.tabCloak.checked = !!data.tabCloak;
        elements.cloakTitle.value = data.cloakTitle || "Google Docs";
        elements.notes.value = data.notes || "";
    });

    // Save settings
    elements.saveBtn.addEventListener('click', () => {
        const settings = {
            antiDetection: elements.antiDetection.checked,
            bypassRestrictions: elements.bypassRestrictions.checked,
            tabCloak: elements.tabCloak.checked,
            cloakTitle: elements.cloakTitle.value,
            notes: elements.notes.value
        };

        chrome.storage.local.set(settings, () => {
            // Show status
            elements.status.style.opacity = '1';
            setTimeout(() => {
                elements.status.style.opacity = '0';
            }, 2000);

            // Notify content script to update (optional, simple reload is usually cleaner for these features)
            /*
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {action: "reloadConfig"});
            });
            */
        });
    });

    // Ensure content script is running before sending message
    async function ensureContentScriptLoaded(tabId) {
        try {
            // Try to ping the content script
            await new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
                    if (chrome.runtime.lastError || !response) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        } catch (e) {
            // If ping fails, inject the script manually
            console.log("Content script not found. Injecting manually...");
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['content.js']
            });
            // Wait a bit for script to initialize
            await new Promise(r => setTimeout(r, 100));
        }
    }

    // Helper to send message with error handling
    async function sendTabMessage(action) {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab || !activeTab.id) return;

            // Check if it's a restricted URL
            const restrictedPrefixes = ['chrome://', 'edge://', 'about:', 'https://chrome.google.com/webstore'];
            if (restrictedPrefixes.some(prefix => activeTab.url.startsWith(prefix))) {
                elements.status.innerText = "Can't run on browser pages";
                elements.status.style.opacity = '1';
                setTimeout(() => elements.status.style.opacity = '0', 2000);
                return;
            }

            await ensureContentScriptLoaded(activeTab.id);

            chrome.tabs.sendMessage(activeTab.id, { action }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Final connection attempt failed:", chrome.runtime.lastError.message);
                    elements.status.innerText = "Error: Refresh tab manually";
                    elements.status.style.opacity = '1';
                    setTimeout(() => elements.status.style.opacity = '0', 2000);
                }
            });
        });
    }

    // Toggle Ghost Overlay
    elements.toggleGhostBtn.addEventListener('click', () => {
        sendTabMessage('toggleGhost');
    });

    // Toggle Search Panel
    elements.toggleSearchBtn.addEventListener('click', () => {
        sendTabMessage('toggleSearch');
    });

    // Clear All Data
    elements.clearDataBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to wipe all notes and settings?")) {
            chrome.storage.local.clear(() => {
                elements.status.innerText = "Data wiped!";
                elements.status.style.opacity = '1';
                setTimeout(() => {
                    location.reload();
                }, 1500);
            });
        }
    });

});
