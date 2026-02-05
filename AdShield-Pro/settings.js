const settings = ['stealthToggle', 'socialToggle', 'malwareToggle', 'cookieToggle', 'lightThemeToggle'];

document.addEventListener('DOMContentLoaded', async () => {
    const data = await chrome.storage.local.get(settings);

    settings.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        if (data[id] !== undefined) el.checked = data[id];

        if (id === 'lightThemeToggle' && el.checked) {
            document.body.classList.add('light-theme');
        }

        el.onchange = (e) => {
            chrome.storage.local.set({ [id]: e.target.checked });
            if (id === 'lightThemeToggle') {
                document.body.classList.toggle('light-theme', e.target.checked);
            }
        };
    });
});

// Listen for theme changes from other pages
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lightThemeToggle) {
        const checkbox = document.getElementById('lightThemeToggle');
        if (checkbox) {
            checkbox.checked = changes.lightThemeToggle.newValue;
        }
        if (changes.lightThemeToggle.newValue) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }
});
