// content/guard.js
// IRON DOME Content Security: Immediate DOM-level intercept

(async function () {
    // 1. Check if we are on the block page already
    if (window.location.href.includes('blocked/blocked.html')) return;

    // 2. Query storage (Local is ultra-fast)
    const data = await chrome.storage.local.get(['blockedSites', 'blockedWords', 'categories', 'isFocusMode', 'totalLockdown', 'whitelistMode', 'schedule']);

    // 3. Helper to check schedule
    function checkSchedule(s) {
        if (!s || !s.enabled || !s.intervals || !s.intervals.length) return false;
        const now = new Date();
        const day = now.getDay(), time = now.getHours() * 60 + now.getMinutes();
        return s.intervals.some(i => {
            if (!i.days.includes(day)) return false;
            const [sh, sm] = i.startTime.split(':').map(Number), [eh, em] = i.endTime.split(':').map(Number);
            const start = sh * 60 + sm, end = eh * 60 + em;
            return (end < start) ? (time >= start || time < end) : (time >= start && time <= end);
        });
    }

    const isScheduleActive = checkSchedule(data.schedule);
    const hostname = window.location.hostname.toLowerCase().replace(/^www\./, '');
    let shouldBlock = false;

    // 4. THE 100% LOGIC
    if (data.totalLockdown) {
        shouldBlock = true;
    } else if (data.whitelistMode && (data.isFocusMode || isScheduleActive)) {
        shouldBlock = !(data.blockedSites || []).some(s => s.enabled && (hostname === s.domain || hostname.endsWith('.' + s.domain)));
    } else {
        const isCustomBlocked = (data.blockedSites || []).some(s => s.enabled && (hostname === s.domain || hostname.endsWith('.' + s.domain)));

        let isFocusBlocked = false;
        if (data.isFocusMode || isScheduleActive) {
            // Check keywords in URL
            const isKeywordPresent = (data.blockedWords || []).some(w => w.enabled && window.location.href.toLowerCase().includes(w.word.toLowerCase()));

            // Check categories (hardcoded map for content script)
            const CATEGORY_MAP = {
                social: ['facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com', 'linkedin.com', 'reddit.com', 'pinterest.com', 'snapchat.com'],
                video: ['youtube.com', 'netflix.com', 'twitch.tv', 'hulu.com', 'disneyplus.com', 'vimeo.com', 'primevideo.com'],
                games: ['twitch.tv', 'steamcommunity.com', 'roblox.com', 'minecraft.net', 'epicgames.com', 'discord.com', 'igntv.com'],
                news: ['cnn.com', 'bbc.com', 'nytimes.com', 'foxnews.com', 'reuters.com', 'theguardian.com', 'wsj.com'],
                shopping: ['amazon.com', 'ebay.com', 'etsy.com', 'walmart.com', 'target.com', 'aliexpress.com', 'temu.com']
            };

            let isCategoryBlocked = false;
            for (const [cat, enabled] of Object.entries(data.categories || {})) {
                if (enabled && CATEGORY_MAP[cat]?.some(d => hostname === d || hostname.endsWith('.' + d))) {
                    isCategoryBlocked = true;
                    break;
                }
            }
            isFocusBlocked = isKeywordPresent || isCategoryBlocked;
        }
        shouldBlock = isCustomBlocked || isFocusBlocked;
    }

    // 5. THE KILL SIGNAL
    if (shouldBlock) {
        // Stop any further script execution
        window.stop();

        // Wipe the DOM immediately to prevent flashes
        document.documentElement.innerHTML = `
            <div style="background:#0f172a; color:white; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding:20px;">
                <div>
                    <h1 style="font-size:48px; margin-bottom:10px;">🔒 FocusGuard Active</h1>
                    <p style="font-size:18px; opacity:0.8;">Redirecting you to your focus goals...</p>
                </div>
            </div>
        `;

        // Redirect to the official block page
        const blockedUrl = chrome.runtime.getURL("blocked/blocked.html") + "?blockedUrl=" + encodeURIComponent(window.location.href);
        window.location.replace(blockedUrl);
    }
})();
