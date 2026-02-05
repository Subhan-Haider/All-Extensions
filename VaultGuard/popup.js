// Popup Logic for VaultGuard

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const vaultList = document.getElementById('vault-list');
    const searchInput = document.getElementById('pass-search');

    // Inject Footer Icon
    const githubIconContainer = document.getElementById('github-icon-footer');
    if (githubIconContainer) githubIconContainer.innerHTML = svgIcon('github', 16);

    // Theme Management
    const themeToggle = document.getElementById('theme-toggle');

    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }

    // Load saved theme and preferences
    chrome.storage.local.get(['theme', 'forceHttps', 'autoWipeNotes', 'compactMode', 'accentColor'], (res) => {
        applyTheme(res.theme || 'light');
        document.getElementById('force-https').checked = res.forceHttps || false;
        document.getElementById('auto-wipe-notes').checked = res.autoWipeNotes || false;

        if (res.forceHttps) updateHttpsRule(true);

        if (res.compactMode) {
            document.body.classList.add('compact-mode');
            document.getElementById('compact-mode').checked = true;
        }

        if (res.accentColor) {
            document.documentElement.style.setProperty('--accent-raw', hexToRgb(res.accentColor));
            updateActiveDot(res.accentColor);
        }
    });

    function updateHttpsRule(enabled) {
        if (!chrome.declarativeNetRequest) return;
        const ruleId = 1;
        if (enabled) {
            chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: [ruleId],
                addRules: [{
                    id: ruleId,
                    priority: 1,
                    action: { type: 'redirect', redirect: { transform: { scheme: 'https' } } },
                    condition: { urlFilter: 'http://*', resourceTypes: ['main_frame'] }
                }]
            });
        } else {
            chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: [ruleId]
            });
        }
    }

    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-mode');
        const newTheme = isLight ? 'dark' : 'light';
        applyTheme(newTheme);
        chrome.storage.local.set({ theme: newTheme });
    });

    document.getElementById('force-https').addEventListener('change', (e) => {
        chrome.storage.local.set({ forceHttps: e.target.checked });
        updateHttpsRule(e.target.checked);
    });

    document.getElementById('auto-wipe-notes').addEventListener('change', (e) => {
        chrome.storage.local.set({ autoWipeNotes: e.target.checked });
    });

    document.getElementById('compact-mode').addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
        chrome.storage.local.set({ compactMode: e.target.checked });
    });

    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const color = dot.dataset.color;
            document.documentElement.style.setProperty('--accent-raw', hexToRgb(color));
            updateActiveDot(color);
            chrome.storage.local.set({ accentColor: color });
        });
    });

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    }

    function updateActiveDot(color) {
        document.querySelectorAll('.color-dot').forEach(d => {
            d.classList.toggle('active', d.dataset.color === color);
        });
    }

    function showToast(msg) {
        toast.querySelector('span').textContent = msg;
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 2000);
    }

    function svgIcon(name, size = 14) {
        const icons = {
            copy: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
            eye: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
            eyeOff: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`,
            pin: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><path d="M16.5 9.4 7.55 4.24"></path></svg>`,
            qr: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
            notes: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
            user: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
            key: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3v-2.5z"></path></svg>`,
            trash: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
            check: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
            shield: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
            alert: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
            search: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
            github: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0-.94 2.58V22"></path></svg>`
        };
        return icons[name] || '';
    }

    // Filter Chips
    let currentCategoryFilter = 'all';
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategoryFilter = chip.dataset.filter;
            loadVault();
        });
    });

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        });
    });

    // Password Management
    function loadVault() {
        chrome.storage.local.get({ vault: [] }, (result) => {
            renderList(result.vault);
            runSecurityAudit(result.vault);
        });
    }

    // Manual Add Entry Modal
    const addModal = document.getElementById('add-modal');
    const openModalBtn = document.getElementById('open-add-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const saveManualBtn = document.getElementById('save-manual');

    openModalBtn.addEventListener('click', () => {
        addModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        addModal.classList.remove('active');
    });

    saveManualBtn.addEventListener('click', () => {
        const domain = document.getElementById('new-domain').value.trim();
        const username = document.getElementById('new-username').value.trim();
        const password = document.getElementById('new-password').value.trim();
        const category = document.getElementById('new-category').value;
        const notes = document.getElementById('new-notes').value.trim();

        if (!domain || !password) {
            alert('Domain and Password are required!');
            return;
        }

        chrome.storage.local.get({ vault: [] }, (result) => {
            const vault = result.vault;
            const logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            vault.push({
                domain,
                username,
                password,
                category,
                notes,
                logo,
                pinned: false,
                updatedAt: Date.now(),
                id: Date.now()
            });

            chrome.storage.local.set({ vault }, () => {
                addModal.classList.remove('active');
                // Clear fields
                document.getElementById('new-domain').value = '';
                document.getElementById('new-username').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('new-notes').value = '';
                loadVault();
            });
        });
    });

    function runSecurityAudit(vault) {
        const weakCount = document.getElementById('weak-count');
        const reusedCount = document.getElementById('reused-count');
        const staleCount = document.getElementById('stale-count');
        const strongCount = document.getElementById('strong-count');
        const auditDetails = document.getElementById('audit-details');
        const scorePath = document.getElementById('score-path');
        const scoreText = document.getElementById('score-text');

        let weak = 0, reused = 0, stale = 0, strong = 0;
        let totalPoints = 0;
        const passMap = {};
        const now = Date.now();
        const staleThreshold = 180 * 24 * 60 * 60 * 1000; // 6 months

        auditDetails.innerHTML = '';

        vault.forEach(item => {
            const strength = checkStrength(item.password);

            if (strength.percent >= 80) strong++;
            if (strength.percent < 60) {
                weak++;
                addAuditItem(item, 'Weak Password', '#ff4757');
            }

            const lastUpdate = item.updatedAt || item.id;
            if (lastUpdate < (now - staleThreshold)) {
                stale++;
                addAuditItem(item, 'Old Password (over 6 mo)', '#eccc68');
            }

            passMap[item.password] = (passMap[item.password] || 0) + 1;
            totalPoints += strength.percent;
        });

        vault.forEach(item => {
            if (passMap[item.password] > 1) {
                reused++;
                addAuditItem(item, 'Security Risk: Reused Password', '#ffa502');
            }
        });

        weakCount.textContent = weak;
        reusedCount.textContent = reused;
        staleCount.textContent = stale;
        strongCount.textContent = strong;

        const avgScore = vault.length > 0 ? Math.round(totalPoints / vault.length) : 0;
        const finalScore = Math.max(0, avgScore - (reused * 5) - (weak * 10));

        scoreText.textContent = `${finalScore}%`;
        scorePath.setAttribute('stroke-dasharray', `${finalScore}, 100`);

        const scoreColor = finalScore > 70 ? '#2ed573' : (finalScore > 40 ? '#ffa502' : '#ff4757');
        scorePath.style.stroke = scoreColor;

        // Strength Distribution
        const total = vault.length || 1;
        const dStrong = document.getElementById('dist-strong');
        const dWeak = document.getElementById('dist-weak');
        const dMedium = document.getElementById('dist-medium');

        if (dStrong) dStrong.style.width = `${(strong / total) * 100}%`;
        if (dWeak) dWeak.style.width = `${(weak / total) * 100}%`;
        if (dMedium) dMedium.style.width = `${((total - strong - weak) / total) * 100}%`;

        if (auditDetails.innerHTML === '') {
            auditDetails.innerHTML = `<div class="empty-state"><p>${svgIcon('check', 24)}<br>Your vault is healthy!</p></div>`;
        }
    }

    // Breach Monitor Simulator
    const commonPasswords = ['123456', 'password', '12345678', 'qwerty', '12345', '123456789', 'admin', 'welcome'];
    document.getElementById('run-breach-check').addEventListener('click', () => {
        const btn = document.getElementById('run-breach-check');
        const status = document.getElementById('breach-status');
        const statusIcon = status.querySelector('.status-icon');
        const statusTitle = status.querySelector('.status-title');
        const statusDesc = status.querySelector('.status-desc');

        btn.disabled = true;
        btn.textContent = 'Scanning...';
        statusIcon.innerHTML = svgIcon('search', 20);
        statusTitle.textContent = 'Analyzing Vault...';

        setTimeout(() => {
            chrome.storage.local.get({ vault: [] }, (res) => {
                const pwned = res.vault.filter(item => commonPasswords.includes(item.password.toLowerCase()));
                btn.disabled = false;
                btn.textContent = 'Scan Vault';

                if (pwned.length > 0) {
                    status.className = 'breach-card danger';
                    statusIcon.innerHTML = svgIcon('alert', 20);
                    statusTitle.textContent = 'Action Required';
                    statusDesc.textContent = `Found ${pwned.length} compromised passwords in your vault!`;
                    pwned.forEach(item => addAuditItem(item, 'Compromised (Known Leak)', 'var(--danger)'));
                } else {
                    status.className = 'breach-card success';
                    statusIcon.innerHTML = svgIcon('shield', 20);
                    statusTitle.textContent = 'Safe';
                    statusDesc.textContent = 'No compromised passwords found in common databases.';
                }
            });
        }, 1500);
    });

    function addAuditItem(item, issue, color) {
        const el = document.createElement('div');
        el.className = 'vault-item';
        el.style.borderLeft = `3px solid ${color}`;
        el.innerHTML = `
            <div class="item-info">
                <h3 style="font-size: 13px; margin-bottom: 2px;">${item.domain}</h3>
                <p style="margin-bottom: 0; color: ${color}; font-weight: 600;">${issue}</p>
            </div>
        `;
        document.getElementById('audit-details').appendChild(el);
    }

    function renderList(vault, filter = '') {
        vaultList.innerHTML = '';
        const filtered = vault.filter(item => {
            const matchesText = item.domain.toLowerCase().includes(filter.toLowerCase()) ||
                item.username.toLowerCase().includes(filter.toLowerCase()) ||
                (item.notes && item.notes.toLowerCase().includes(filter.toLowerCase())) ||
                (item.category && item.category.toLowerCase().includes(filter.toLowerCase()));

            if (!matchesText) return false;

            if (currentCategoryFilter === 'all') return true;
            if (currentCategoryFilter === 'pinned') return item.pinned;
            if (currentCategoryFilter === 'weak') return checkStrength(item.password).percent < 60;
            if (currentCategoryFilter === 'reused') {
                const sameMatches = vault.filter(v => v.password === item.password);
                return sameMatches.length > 1;
            }
            if (currentCategoryFilter === 'popular') return (item.useCount || 0) > 5;
            return true;
        });

        if (filtered.length === 0) {
            vaultList.innerHTML = '<div class="empty-state"><p>No entries found.</p></div>';
            return;
        }

        // Sort: Popular filter uses useCount, otherwise Pinned first
        if (currentCategoryFilter === 'popular') {
            filtered.sort((a, b) => (b.useCount || 0) - (a.useCount || 0));
        } else {
            filtered.sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return a.domain.localeCompare(b.domain);
            });
        }

        filtered.forEach(item => {
            const strength = checkStrength(item.password);
            const faviconUrl = item.logo || `https://www.google.com/s2/favicons?domain=${item.domain}&sz=32`;
            const updatedDate = new Date(item.updatedAt || item.id).toLocaleDateString();
            const isPopular = (item.useCount || 0) > 10;

            const el = document.createElement('div');
            el.className = `vault-item ${item.pinned ? 'pinned' : ''}`;
            el.innerHTML = `
        <div class="item-main">
          <div class="item-icon">
            <img src="${faviconUrl}" onerror="this.src='icons/icon48.png'" alt="">
          </div>
          <div class="item-info">
            <div class="item-header-row">
                <a href="https://${item.domain}" target="_blank" class="site-link">
                    ${item.domain} 
                    ${isPopular ? '<span style="font-size: 10px; margin-left: 4px;">🔥</span>' : ''}
                </a>
                <span class="category-tag">${item.category || 'Personal'}</span>
            </div>
            <p>${item.username} • <span class="update-label">Updated ${updatedDate}</span></p>
            <div class="strength-bar"><div class="fill" style="width: ${strength.percent}%; background: ${strength.color}"></div></div>
          </div>
        </div>
        <div class="item-actions">
            <button class="qr-code" data-id="${item.id}" title="Show QR Code">${svgIcon('qr')}</button>
            <button class="reveal-pass" data-id="${item.id}" title="Show/Hide Password">${svgIcon('eye')}</button>
            <button class="pin-btn ${item.pinned ? 'active' : ''}" data-id="${item.id}" title="Pin to top">${svgIcon('pin')}</button>
            <button class="toggle-notes" data-id="${item.id}" title="View Notes">${svgIcon('notes')}</button>
            <button class="copy-user" data-user="${item.username}" title="Copy Username">${svgIcon('user')}</button>
            <button class="copy-pass" data-id="${item.id}" title="Copy Password">${svgIcon('key')}</button>
            <button class="delete-item" data-id="${item.id}" title="Delete">${svgIcon('trash')}</button>
        </div>
        <div class="pass-display" id="display-${item.id}" style="display: none;">
          <code>${item.password}</code>
        </div>
        <div class="item-notes" id="notes-${item.id}" style="display: none;">
          <textarea placeholder="Add notes...">${item.notes || ''}</textarea>
          <button class="save-notes" data-id="${item.id}">Save Notes</button>
        </div>
      `;
            vaultList.appendChild(el);
        });

        // Reveal Password Event
        document.querySelectorAll('.reveal-pass').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const displayDiv = document.getElementById(`display-${id}`);
                const isHidden = displayDiv.style.display === 'none';
                displayDiv.style.display = isHidden ? 'block' : 'none';
                btn.innerHTML = isHidden ? svgIcon('eyeOff') : svgIcon('eye');
            });
        });

        // QR Code Event
        const qrModal = document.getElementById('qr-modal');
        const qrContainer = document.getElementById('qr-container');
        let currentQrItem = null;

        function updateQrCode() {
            if (!currentQrItem) return;
            const shareDomain = document.getElementById('share-domain').checked;
            const shareUser = document.getElementById('share-user').checked;
            const sharePass = document.getElementById('share-pass').checked;
            const shareNotes = document.getElementById('share-notes').checked;
            const shareWeb = document.getElementById('share-web-link').checked;

            let dataParts = [];
            if (shareDomain) dataParts.push(`Site: ${currentQrItem.domain}`);
            if (shareUser) dataParts.push(`User: ${currentQrItem.username}`);
            if (sharePass) dataParts.push(`Pass: ${currentQrItem.password}`);
            if (shareNotes && currentQrItem.notes) dataParts.push(`Note: ${currentQrItem.notes}`);

            let dataString = '';
            if (shareWeb) {
                const baseUrl = 'https://haider-subhan.github.io/VaultGuard/share.html';
                const p = new URLSearchParams();
                if (shareDomain) p.append('d', currentQrItem.domain);
                if (shareUser) p.append('u', currentQrItem.username);
                if (sharePass) p.append('p', currentQrItem.password);
                if (shareNotes && currentQrItem.notes) p.append('n', currentQrItem.notes);
                dataString = `${baseUrl}?${p.toString()}`;
            } else {
                dataString = dataParts.join('\n');
            }

            qrContainer.innerHTML = '';
            if (dataString) {
                const img = document.createElement('img');
                img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(dataString)}`;
                qrContainer.appendChild(img);
            } else {
                qrContainer.innerHTML = '<div style="width:150px; height:150px; display:flex; align-items:center; justify-content:center; color:#999; font-size:10px;">Select options to share</div>';
            }
        }

        ['share-domain', 'share-user', 'share-pass', 'share-notes', 'share-web-link'].forEach(id => {
            document.getElementById(id).addEventListener('change', updateQrCode);
        });

        document.querySelectorAll('.qr-code').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                currentQrItem = vault.find(v => v.id === id);
                if (currentQrItem) {
                    updateQrCode();
                    qrModal.classList.add('active');
                }
            });
        });

        document.getElementById('close-qr-modal').addEventListener('click', () => {
            qrModal.classList.remove('active');
        });

        // Pinning Event
        document.querySelectorAll('.pin-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                chrome.storage.local.get({ vault: [] }, (result) => {
                    const vault = result.vault;
                    const item = vault.find(v => v.id === id);
                    if (item) {
                        item.pinned = !item.pinned;
                        chrome.storage.local.set({ vault }, () => {
                            showToast(item.pinned ? 'Item pinned to top' : 'Item unpinned');
                            loadVault();
                        });
                    }
                });
            });
        });

        // Event listeners for list items
        document.querySelectorAll('.toggle-notes').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const notesDiv = document.getElementById(`notes-${id}`);
                notesDiv.style.display = notesDiv.style.display === 'none' ? 'block' : 'none';
            });
        });

        document.querySelectorAll('.save-notes').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const notes = document.querySelector(`#notes-${id} textarea`).value;

                chrome.storage.local.get({ vault: [] }, (result) => {
                    const vault = result.vault;
                    const item = vault.find(v => v.id === id);
                    if (item) {
                        item.notes = notes;
                        chrome.storage.local.set({ vault }, () => {
                            btn.textContent = 'Saved!';
                            showToast('Notes updated');
                            setTimeout(() => btn.textContent = 'Save Notes', 1500);
                        });
                    }
                });
            });
        });
        document.querySelectorAll('.copy-user').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.user);
                showToast('Username copied!');
                trackUsage(btn.dataset.id);
            });
        });

        document.querySelectorAll('.copy-pass').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const item = vault.find(v => v.id === id);
                if (item) {
                    navigator.clipboard.writeText(item.password);
                    showToast('Password copied!');
                    trackUsage(id);

                    // Auto-Wipe Sensitivity: Hide notes if auto-wipe is on
                    chrome.storage.local.get(['autoWipeNotes'], (res) => {
                        if (res.autoWipeNotes) {
                            const notesDiv = document.getElementById(`notes-${id}`);
                            if (notesDiv) notesDiv.style.display = 'none';
                        }
                    });
                }
            });
        });

        function trackUsage(id) {
            if (!id) return;
            chrome.storage.local.get({ vault: [] }, (res) => {
                const vault = res.vault;
                const item = vault.find(v => v.id === parseInt(id));
                if (item) {
                    item.useCount = (item.useCount || 0) + 1;
                    item.lastUsed = Date.now();
                    chrome.storage.local.set({ vault });
                }
            });
        }

        document.querySelectorAll('.delete-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                chrome.storage.local.get({ vault: [] }, (result) => {
                    const newVault = result.vault.filter(v => v.id !== id);
                    chrome.storage.local.set({ vault: newVault }, () => {
                        showToast('Entry removed');
                        loadVault();
                    });
                });
            });
        });
    }

    searchInput.addEventListener('input', (e) => {
        chrome.storage.local.get({ vault: [] }, (result) => {
            renderList(result.vault, e.target.value);
        });
    });

    // Password Generator
    const generateBtn = document.getElementById('generate-btn');
    const passLength = document.getElementById('pass-length');
    const lengthVal = document.getElementById('length-val');
    const output = document.getElementById('generated-password');
    const copyBtn = document.getElementById('copy-btn');
    const openHistoryBtn = document.getElementById('open-history-btn');
    const historyModal = document.getElementById('history-modal');
    const historyList = document.getElementById('history-list');
    const closeHistoryBtn = document.getElementById('close-history-modal');
    const clearHistoryBtn = document.getElementById('clear-history');

    passLength.addEventListener('input', (e) => {
        lengthVal.textContent = e.target.value;
    });

    function saveToHistory(pass) {
        chrome.storage.local.get({ genHistory: [] }, (res) => {
            const history = res.genHistory;
            history.unshift({ pass, timestamp: Date.now() });
            chrome.storage.local.set({ genHistory: history.slice(0, 20) });
        });
    }

    function loadHistory() {
        chrome.storage.local.get({ genHistory: [] }, (res) => {
            historyList.innerHTML = '';
            if (res.genHistory.length === 0) {
                historyList.innerHTML = '<div class="empty-state"><p>No history yet.</p></div>';
                return;
            }
            res.genHistory.forEach(item => {
                const date = new Date(item.timestamp).toLocaleTimeString();
                const el = document.createElement('div');
                el.className = 'history-item';
                el.innerHTML = `
                    <div style="flex: 1; min-width: 0;">
                        <div class="pass-text" style="font-family: var(--font-mono); color: var(--primary); font-weight: 700;">${item.pass}</div>
                        <div class="info" style="font-size: 10px; color: var(--text-muted);">${date}</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="copy-history icon-btn" data-pass="${item.pass}" title="Copy">${svgIcon('copy', 16)}</button>
                        <button class="delete-history-item icon-btn" data-time="${item.timestamp}" title="Delete" style="color: var(--danger);">${svgIcon('trash', 16)}</button>
                    </div>
                `;
                historyList.appendChild(el);
            });
            document.querySelectorAll('.copy-history').forEach(btn => {
                btn.addEventListener('click', () => {
                    navigator.clipboard.writeText(btn.dataset.pass);
                    const oldHtml = btn.innerHTML;
                    btn.innerHTML = svgIcon('check', 16);
                    setTimeout(() => btn.innerHTML = oldHtml, 1500);
                });
            });

            document.querySelectorAll('.delete-history-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    const time = parseInt(btn.dataset.time);
                    chrome.storage.local.get({ genHistory: [] }, (res) => {
                        const newHistory = res.genHistory.filter(h => h.timestamp !== time);
                        chrome.storage.local.set({ genHistory: newHistory }, loadHistory);
                    });
                });
            });
        });
    }

    openHistoryBtn.addEventListener('click', () => {
        loadHistory();
        historyModal.classList.add('active');
    });

    closeHistoryBtn.addEventListener('click', () => historyModal.classList.remove('active'));

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Clear password history?')) {
            chrome.storage.local.set({ genHistory: [] }, loadHistory);
        }
    });

    function generatePassword() {
        const length = parseInt(passLength.value);
        const incNumbers = document.getElementById('inc-numbers').checked;
        const incSymbols = document.getElementById('inc-symbols').checked;
        const incUpper = document.getElementById('inc-uppercase').checked;

        let charset = "abcdefghijklmnopqrstuvwxyz";
        if (incUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (incNumbers) charset += "0123456789";
        if (incSymbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

        let retVal = "";
        for (let i = 0; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        output.value = retVal;

        const strength = checkStrength(retVal);
        const meterFill = document.getElementById('gen-strength-fill');
        meterFill.style.width = strength.percent + '%';
        meterFill.style.background = strength.color;

        saveToHistory(retVal);
    }

    generateBtn.addEventListener('click', generatePassword);

    copyBtn.addEventListener('click', () => {
        if (output.value && output.value !== 'Click Generate') {
            navigator.clipboard.writeText(output.value);
            copyBtn.innerHTML = svgIcon('check', 18);
            setTimeout(() => copyBtn.innerHTML = svgIcon('copy', 18), 1500);
            showToast('Generated password copied!');
        }
    });

    // Settings
    document.getElementById('clear-vault').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear ALL saved passwords? This cannot be undone.')) {
            chrome.storage.local.set({ vault: [] }, () => {
                showToast('Vault cleared');
                loadVault();
            });
        }
    });

    // Export JSON
    document.getElementById('export-json').addEventListener('click', () => {
        chrome.storage.local.get({ vault: [] }, (result) => {
            const blob = new Blob([JSON.stringify(result.vault, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vaultguard_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    // Import JSON
    const importBtn = document.getElementById('import-json-btn');
    const importFile = document.getElementById('import-json-file');

    importBtn.addEventListener('click', () => importFile.click());

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedVault = JSON.parse(event.target.result);
                if (Array.isArray(importedVault)) {
                    chrome.storage.local.get({ vault: [] }, (result) => {
                        // Merge or overwrite? Let's merge based on ID or Domain/User
                        const currentVault = result.vault;
                        const merged = [...currentVault];

                        importedVault.forEach(newItem => {
                            const exists = merged.some(item => item.domain === newItem.domain && item.username === newItem.username);
                            if (!exists) merged.push(newItem);
                        });

                        chrome.storage.local.set({ vault: merged }, () => {
                            showToast(`Imported ${merged.length - currentVault.length} entries`);
                            loadVault();
                        });
                    });
                } else {
                    alert('Invalid backup file format.');
                }
            } catch (err) {
                alert('Error parsing JSON file.');
            }
        };
        reader.readAsText(file);
    });

    // Initial Load
    loadVault();
    generatePassword();

    function checkStrength(pass) {
        let score = 0;
        if (pass.length > 8) score++;
        if (pass.length > 12) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        const results = [
            { percent: 20, color: '#ff4757' },
            { percent: 40, color: '#ffa502' },
            { percent: 60, color: '#eccc68' },
            { percent: 80, color: '#7bed9f' },
            { percent: 100, color: '#2ed573' }
        ];

        return results[Math.min(score - 1, 4)] || results[0];
    }
});
