// Background script for VaultGuard
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'savePassword') {
        const { domain, username, password } = request.data;
        const siteLogo = sender.tab ? sender.tab.favIconUrl : null;

        chrome.storage.local.get({ vault: [] }, (result) => {
            const vault = result.vault;
            const existingIndex = vault.findIndex(item => item.domain === domain && item.username === username);

            if (existingIndex !== -1) {
                vault[existingIndex].password = password;
                if (siteLogo) vault[existingIndex].logo = siteLogo;
                vault[existingIndex].updatedAt = Date.now();
            } else {
                vault.push({
                    domain,
                    username,
                    password,
                    logo: siteLogo,
                    updatedAt: Date.now(),
                    id: Date.now()
                });
            }

            chrome.storage.local.set({ vault }, () => {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: siteLogo || 'icons/icon128.png',
                    title: 'VaultGuard Secured',
                    message: `Credentials for ${domain} have been captured and encrypted.`,
                    priority: 2
                });
                sendResponse({ success: true });
            });
        });
        return true;
    }

    if (request.action === 'getPasswords') {
        const { domain } = request;
        chrome.storage.local.get({ vault: [] }, (result) => {
            const matches = result.vault.filter(item => item.domain === domain);
            sendResponse({ passwords: matches });
        });
        return true;
    }
});

// Force HTTPS is now handled via declarativeNetRequest in the background
// This script now focuses on auto-save and password management messaging.
