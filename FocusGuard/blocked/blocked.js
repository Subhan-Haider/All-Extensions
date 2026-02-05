const QUOTES = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
    { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "The path to success is to take massive, determined action.", author: "Tony Robbins" },
    { text: "Efficiency is doing things right; effectiveness is doing the right things.", author: "Peter Drucker" },
    { text: "You will never reach your destination if you stop and throw stones at every dog that barks.", author: "Winston Churchill" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
];

document.addEventListener('DOMContentLoaded', async () => {
    // Select a random quote
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    document.getElementById('quote-text').textContent = `"${randomQuote.text}"`;
    document.getElementById('quote-author').textContent = randomQuote.author;

    // Load Stats
    const data = await chrome.storage.local.get(['statistics']);
    if (data.statistics) {
        let totalDaily = 0;
        if (data.statistics.daily) {
            Object.values(data.statistics.daily).forEach(v => totalDaily += v);
        }
        document.getElementById('distraction-count').textContent = totalDaily;

        const focusMins = data.statistics.focusMode ? data.statistics.focusMode.minutes : 0;
        document.getElementById('total-focus').textContent = Math.floor(focusMins);
    }

    // Handle "Go Back"
    document.getElementById('go-back-btn').addEventListener('click', (e) => {
        e.preventDefault();
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // If no history, just go to a neutral page or close tab
            window.location.href = "https://www.google.com";
        }
    });

    // Record the block event if it hasn't been recorded yet for this page load
    const urlParams = new URLSearchParams(window.location.search);
    const blockedUrl = urlParams.get('blockedUrl');
    if (blockedUrl) {
        chrome.runtime.sendMessage({ action: "RECORD_BLOCK", domain: new URL(blockedUrl).hostname });
    }
});
