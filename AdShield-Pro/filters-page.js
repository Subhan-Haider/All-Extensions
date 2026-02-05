// Filters manager logic

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

async function renderFilters() {
    const filterList = document.getElementById('filterList');
    if (!filterList) return;

    const result = await chrome.storage.local.get(['customFilters']);
    const filters = result.customFilters || [];

    if (filters.length === 0) {
        filterList.innerHTML = '<p style="color:var(--text-secondary); text-align:center;">No custom filters added.</p>';
        return;
    }

    filterList.innerHTML = '';
    filters.forEach(filter => {
        const item = document.createElement('div');
        item.className = 'filter-item';
        item.innerHTML = `
            <span class="filter-pattern">${filter}</span>
            <button class="btn-remove" data-filter="${filter}">Remove</button>
        `;
        filterList.appendChild(item);
    });

    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.onclick = async (e) => {
            const filterToRemove = e.target.getAttribute('data-filter');
            const res = await chrome.storage.local.get(['customFilters']);
            let updated = (res.customFilters || []).filter(f => f !== filterToRemove);
            await chrome.storage.local.set({ customFilters: updated });
            chrome.runtime.sendMessage({ action: 'updateRules' }).catch(() => { });
            await renderFilters();
        };
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await applyTheme();
    await renderFilters();

    const addBtn = document.getElementById('addFilterBtn');
    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const input = document.getElementById('filterInput');
            if (!input) return;
            const pattern = input.value.trim();

            if (pattern) {
                const result = await chrome.storage.local.get(['customFilters']);
                let filters = result.customFilters || [];

                if (!filters.includes(pattern)) {
                    filters.push(pattern);
                    await chrome.storage.local.set({ customFilters: filters });
                    chrome.runtime.sendMessage({ action: 'updateRules' }).catch(() => { });
                    input.value = '';
                    await renderFilters();
                }
            }
        });
    }
});