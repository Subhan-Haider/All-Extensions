// Whitelist manager logic

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

async function renderWhitelist() {
    const siteList = document.getElementById('siteList');
    if (!siteList) return;

    const result = await chrome.storage.local.get(['whitelist']);
    const whitelist = result.whitelist || [];

    if (whitelist.length === 0) {
        siteList.innerHTML = '<p style="color:var(--text-secondary); text-align:center;">No whitelisted sites yet.</p>';
        return;
    }

    siteList.innerHTML = '';
    whitelist.forEach(site => {
        const card = document.createElement('div');
        card.className = 'site-card';
        card.innerHTML = `
            <span>${site}</span>
            <button class="btn-remove" data-site="${site}">Remove</button>
        `;
        siteList.appendChild(card);
    });

    // Event listeners for remove buttons
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.onclick = async (e) => {
            const siteToRemove = e.target.getAttribute('data-site');
            const res = await chrome.storage.local.get(['whitelist']);
            let updated = (res.whitelist || []).filter(s => s !== siteToRemove);
            await chrome.storage.local.set({ whitelist: updated });
            chrome.runtime.sendMessage({ action: 'updateRules' }).catch(() => { });
            await renderWhitelist();
        };
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await applyTheme();
    await renderWhitelist();

    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const input = document.getElementById('siteInput');
            if (!input) return;
            const hostname = input.value.trim().toLowerCase();

            if (hostname) {
                const result = await chrome.storage.local.get(['whitelist']);
                let whitelist = result.whitelist || [];

                if (!whitelist.includes(hostname)) {
                    whitelist.push(hostname);
                    await chrome.storage.local.set({ whitelist });
                    chrome.runtime.sendMessage({ action: 'updateRules' }).catch(() => { });
                    input.value = '';
                    await renderWhitelist();
                }
            }
        });
    }
});
