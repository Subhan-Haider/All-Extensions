document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const listEl = document.getElementById('blocked-list');
    const inputEl = document.getElementById('new-site-input');
    const addBtn = document.getElementById('add-site-btn');
    const wordListEl = document.getElementById('word-list');
    const wordInputEl = document.getElementById('new-word-input');
    const addWordBtn = document.getElementById('add-word-btn');
    const distractionsCountEl = document.getElementById('distractions-count');
    const focusMinutesEl = document.getElementById('focus-minutes');
    const whitelistToggle = document.getElementById('whitelist-mode-toggle');
    const blockResolutionSelect = document.getElementById('block-resolution');
    const categoryItems = document.querySelectorAll('.category-item');
    const navItems = document.querySelectorAll('.nav-item');

    // Navigation logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Initial Load
    refreshList();
    refreshWords();
    loadStats();
    loadSettings();

    // Custom Sites
    addBtn.addEventListener('click', () => {
        const domain = inputEl.value.trim();
        if (domain) {
            chrome.runtime.sendMessage({ action: "BLOCK_DOMAIN", domain }, (res) => {
                if (res && res.success) {
                    inputEl.value = '';
                    refreshList();
                }
            });
        }
    });

    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') addBtn.click(); });

    // Keywords
    addWordBtn.addEventListener('click', async () => {
        const word = wordInputEl.value.trim().toLowerCase();
        if (word) {
            const { blockedWords = [] } = await chrome.storage.local.get('blockedWords');
            if (!blockedWords.some(w => w.word === word)) {
                const newWords = [...blockedWords, { word, enabled: true, addedAt: Date.now() }];
                await chrome.storage.local.set({ blockedWords: newWords });
                wordInputEl.value = '';
                refreshWords();
                chrome.runtime.sendMessage({ action: "REFRESH_RULES" });
            }
        }
    });

    wordInputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') addWordBtn.click(); });

    // Categories
    categoryItems.forEach(item => {
        item.addEventListener('click', async () => {
            const catId = item.dataset.id;
            const { categories = {} } = await chrome.storage.local.get('categories');
            const isEnabled = !categories[catId];
            categories[catId] = isEnabled;
            await chrome.storage.local.set({ categories });
            item.classList.toggle('active', isEnabled);
            chrome.runtime.sendMessage({ action: "REFRESH_RULES" });
        });
    });

    // Settings
    whitelistToggle.addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        await chrome.storage.local.set({ whitelistMode: enabled });
        updateHeader(enabled);
        chrome.runtime.sendMessage({ action: "REFRESH_RULES" });
    });

    blockResolutionSelect.addEventListener('change', (e) => {
        chrome.runtime.sendMessage({ action: "SET_RESOLUTION", resolution: e.target.value });
    });

    async function loadSettings() {
        const data = await chrome.storage.local.get(['whitelistMode', 'resolution', 'categories']);
        whitelistToggle.checked = data.whitelistMode || false;
        blockResolutionSelect.value = data.resolution || 'REDIRECT';
        updateHeader(data.whitelistMode);
        const cats = data.categories || {};
        categoryItems.forEach(item => {
            if (cats[item.dataset.id]) item.classList.add('active');
        });
    }

    function updateHeader(isWhitelist) {
        const header = document.getElementById('managed-header');
        if (header) header.textContent = isWhitelist ? "Whitelisted Sites" : "Sites Guarded";
    }

    async function refreshList() {
        const { blockedSites = [] } = await chrome.storage.local.get('blockedSites');
        listEl.innerHTML = '';
        if (blockedSites.length > 0) {
            blockedSites.forEach(site => {
                const li = document.createElement('li');
                li.className = 'blocked-item';
                li.innerHTML = `
                    <span>${site.domain}</span>
                    <button class="remove-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                `;
                li.querySelector('.remove-btn').addEventListener('click', () => {
                    chrome.runtime.sendMessage({ action: "UNBLOCK_DOMAIN", domain: site.domain }, refreshList);
                });
                listEl.appendChild(li);
            });
        } else {
            listEl.innerHTML = '<li class="blocked-item" style="justify-content:center; opacity:0.6;">No custom domains.</li>';
        }
    }

    async function refreshWords() {
        const { blockedWords = [] } = await chrome.storage.local.get('blockedWords');
        wordListEl.innerHTML = '';
        if (blockedWords.length > 0) {
            blockedWords.forEach(w => {
                const li = document.createElement('li');
                li.className = 'blocked-item';
                li.innerHTML = `
                    <span>${w.word}</span>
                    <button class="remove-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                `;
                li.querySelector('.remove-btn').addEventListener('click', async () => {
                    const { blockedWords: current } = await chrome.storage.local.get('blockedWords');
                    const updated = current.filter(item => item.word !== w.word);
                    await chrome.storage.local.set({ blockedWords: updated });
                    refreshWords();
                    chrome.runtime.sendMessage({ action: "REFRESH_RULES" });
                });
                wordListEl.appendChild(li);
            });
        } else {
            wordListEl.innerHTML = '<li class="blocked-item" style="justify-content:center; opacity:0.6;">No keywords.</li>';
        }
    }

    async function loadStats() {
        const { statistics } = await chrome.storage.local.get('statistics');
        let totalDistractions = 0;
        let totalFocusMinutes = 0;

        if (statistics) {
            if (statistics.daily) Object.values(statistics.daily).forEach(v => totalDistractions += v);
            if (statistics.focusMode) totalFocusMinutes = statistics.focusMode.minutes || 0;
        }

        if (distractionsCountEl) distractionsCountEl.textContent = totalDistractions;
        if (focusMinutesEl) focusMinutesEl.textContent = totalFocusMinutes;
    }

    // Footer link handlers
    document.getElementById('privacy-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://github.com/haider-subhan/Site-Blocker/blob/main/PRIVACY.md', '_blank');
    });

    document.getElementById('help-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://github.com/haider-subhan/Site-Blocker#readme', '_blank');
    });
});
