// Dashboard logic for AdShield Pro

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

async function renderStats() {
    const result = await chrome.storage.local.get(['stats']);
    const stats = result.stats || { adsBlocked: 0, trackersBlocked: 0, dataSaved: 0 };

    const totalAds = document.getElementById('totalAds');
    const totalTrackers = document.getElementById('totalTrackers');
    const totalData = document.getElementById('totalData');

    if (totalAds) totalAds.textContent = stats.adsBlocked.toLocaleString();
    if (totalTrackers) totalTrackers.textContent = stats.trackersBlocked.toLocaleString();

    if (totalData) {
        const mbSaved = (stats.dataSaved / (1024 * 1024)).toFixed(1);
        totalData.textContent = mbSaved + " MB";
    }
}

async function renderCharts() {
    const chartBox = document.getElementById('historyChart');
    if (!chartBox) return;

    // Mocking history data if real history is empty
    const result = await chrome.storage.local.get(['stats']);
    let history = (result.stats && result.stats.history) || [120, 450, 300, 700, 550, 900, 1100];

    // Ensure we have 7 days
    while (history.length < 7) history.unshift(0);
    const max = Math.max(...history, 100);

    chartBox.innerHTML = '';
    history.slice(-7).forEach(val => {
        const height = (val / max) * 100;
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = '0%';
        bar.setAttribute('data-value', val);
        chartBox.appendChild(bar);

        // Trigger animation
        setTimeout(() => {
            bar.style.height = height + '%';
        }, 100);
    });
}

async function renderTopSites() {
    const siteList = document.getElementById('siteList');
    if (!siteList) return;

    const result = await chrome.storage.local.get(['cosmeticRules', 'whitelist']);
    const cosmeticRules = result.cosmeticRules || {};
    const cosmeticSites = Object.keys(cosmeticRules);

    if (cosmeticSites.length === 0) {
        siteList.innerHTML = '<li class="site-item"><span>No site data yet. Start browsing!</span></li>';
        return;
    }

    siteList.innerHTML = '';
    cosmeticSites.slice(0, 5).forEach(site => {
        const item = document.createElement('li');
        item.className = 'site-item';
        const hostname = site.length > 20 ? site.substring(0, 20) + '...' : site;
        const count = (cosmeticRules[site] && cosmeticRules[site].length) || 0;

        item.innerHTML = `
            <span>${hostname}</span>
            <span class="site-count">${count} custom rules</span>
        `;
        siteList.appendChild(item);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await applyTheme();
    await renderStats();
    await renderCharts();
    await renderTopSites();
});
