document.addEventListener('DOMContentLoaded', async () => {
    const currentDomainEl = document.getElementById('current-domain');
    const blockBtn = document.getElementById('block-btn');
    const statusText = document.getElementById('status-text');
    const sitesBlockedCount = document.getElementById('sites-blocked-count');
    const focusToggleBtn = document.getElementById('focus-toggle-btn');
    const timerDisplay = document.getElementById('timer-display');
    const timerContainer = document.getElementById('timer-container');
    const statusIndicator = document.getElementById('status-indicator');
    const settingsBtn = document.getElementById('settings-btn');
    const strictModeToggle = document.getElementById('strict-mode-toggle');
    const durationSelect = document.getElementById('duration-select');
    const lockdownToggle = document.getElementById('lockdown-toggle');
    const progressCircle = document.getElementById('progress-circle');

    let currentDomain = '';
    let focusInterval = null;
    const circleRadius = 54;
    const circleCircumference = 2 * Math.PI * circleRadius;

    if (progressCircle) {
        progressCircle.style.strokeDasharray = `${circleCircumference} ${circleCircumference}`;
        progressCircle.style.strokeDashoffset = circleCircumference;
    }

    function setProgress(percent) {
        if (!progressCircle) return;
        const offset = circleCircumference - (percent / 100 * circleCircumference);
        progressCircle.style.strokeDashoffset = offset;
    }

    async function init() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            try {
                const url = new URL(tab.url);
                currentDomain = url.hostname;
                currentDomainEl.textContent = currentDomain.replace(/^www\./, '');
            } catch (e) {
                currentDomainEl.textContent = "System Page";
                if (blockBtn) blockBtn.disabled = true;
            }
        }

        const data = await chrome.storage.local.get(['blockedSites', 'isFocusMode', 'focusEndTime', 'focusDuration', 'strictMode', 'whitelistMode', 'totalLockdown']);
        updateUI(data);

        if (data.isFocusMode && data.focusEndTime) {
            startTimerTick(data.focusEndTime, data.focusDuration || 25);
        }
    }

    function updateUI(data) {
        if (!data) return;
        const blockedSites = data.blockedSites || [];
        const isLocked = data.totalLockdown || false;

        if (lockdownToggle) lockdownToggle.checked = isLocked;
        if (strictModeToggle) strictModeToggle.checked = data.strictMode || false;

        // Domain Block Button Logic
        if (isLocked) {
            statusText.textContent = "System Locked";
            sitesBlockedCount.textContent = "EVERYTHING BLOCKED";
            if (blockBtn) blockBtn.disabled = true;
        } else {
            if (blockBtn) {
                blockBtn.disabled = false;
                const normalized = currentDomain.toLowerCase().replace(/^www\./, '');
                const isInList = blockedSites.some(s => s.domain === normalized || s.domain === currentDomain);

                if (isInList) {
                    blockBtn.textContent = "Unblock Site";
                    blockBtn.style.background = "var(--surface-color)";
                    blockBtn.style.border = "1px solid var(--border-color)";
                    blockBtn.style.color = "var(--text-primary)";
                    statusText.textContent = "Shield Active";
                } else {
                    blockBtn.textContent = "Block Site";
                    blockBtn.style.background = "linear-gradient(135deg, var(--primary-color), var(--accent-color))";
                    blockBtn.style.color = "white";
                    statusText.textContent = "Shield Standby";
                }
            }
            sitesBlockedCount.textContent = `${blockedSites.length} custom sites blocked`;
        }

        // Focus Session Logic
        if (data.isFocusMode) {
            focusToggleBtn.textContent = "Stop Session";
            focusToggleBtn.classList.add('active');
            if (statusIndicator) statusIndicator.style.display = 'none';
            if (timerContainer) timerContainer.style.display = 'flex';
            if (durationSelect) durationSelect.disabled = true;
        } else {
            focusToggleBtn.textContent = "Start Focus Session";
            focusToggleBtn.classList.remove('active');
            if (statusIndicator) statusIndicator.style.display = 'flex';
            if (timerContainer) timerContainer.style.display = 'none';
            if (durationSelect) {
                durationSelect.disabled = false;
                if (timerDisplay) timerDisplay.textContent = `${durationSelect.value}:00`;
            }
            if (focusInterval) clearInterval(focusInterval);
        }
    }

    blockBtn?.addEventListener('click', async () => {
        if (!currentDomain) return;
        chrome.runtime.sendMessage({ action: "BLOCK_DOMAIN", domain: currentDomain }, (res) => {
            if (res && res.success === false && res.reason === "Already in list") {
                chrome.runtime.sendMessage({ action: "UNBLOCK_DOMAIN", domain: currentDomain }, () => {
                    chrome.storage.local.get(null, updateUI);
                });
            } else {
                chrome.storage.local.get(null, updateUI);
            }
        });
    });

    focusToggleBtn?.addEventListener('click', async () => {
        const isFocusing = focusToggleBtn.classList.contains('active');
        const action = isFocusing ? "STOP_FOCUS" : "START_FOCUS";
        const duration = durationSelect ? parseInt(durationSelect.value) : 25;

        chrome.runtime.sendMessage({ action, durationMinutes: duration }, (response) => {
            if (response && response.success) {
                if (!isFocusing) {
                    chrome.storage.local.set({ focusDuration: duration });
                    startTimerTick(response.endTime, duration);
                    chrome.storage.local.get(null, updateUI);
                } else {
                    if (focusInterval) clearInterval(focusInterval);
                    chrome.storage.local.get(null, updateUI);
                }
            } else if (response && !response.success) {
                alert(response.reason);
            }
        });
    });

    lockdownToggle?.addEventListener('change', (e) => {
        chrome.runtime.sendMessage({ action: "TOGGLE_LOCKDOWN", enabled: e.target.checked }, () => {
            chrome.storage.local.get(null, updateUI);
        });
    });

    strictModeToggle?.addEventListener('change', (e) => {
        chrome.runtime.sendMessage({ action: "TOGGLE_STRICT_MODE", enabled: e.target.checked }, () => {
            chrome.storage.local.get(null, updateUI);
        });
    });

    settingsBtn?.addEventListener('click', () => chrome.runtime.openOptionsPage());

    function startTimerTick(endTime, totalMinutes) {
        if (focusInterval) clearInterval(focusInterval);
        const totalMs = totalMinutes * 60 * 1000;

        function tick() {
            const remaining = endTime - Date.now();
            if (remaining <= 0) {
                clearInterval(focusInterval);
                setProgress(100);
                if (timerDisplay) timerDisplay.textContent = "00:00";
                chrome.storage.local.get(null, updateUI);
                return;
            }

            const percentRemaining = (remaining / totalMs) * 100;
            setProgress(percentRemaining);

            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            if (timerDisplay) timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        tick();
        focusInterval = setInterval(tick, 1000);
    }

    init();
});
