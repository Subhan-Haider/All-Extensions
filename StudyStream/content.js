// Research Clipper Feedback
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'clipSuccess') {
        showToast();
    }
});

function showToast() {
    const toast = document.createElement('div');
    toast.innerText = 'Saved to Research Vault!';
    toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    font-family: 'Outfit', sans-serif;
    z-index: 10000;
    animation: slideInToast 0.5s ease, fadeOutToast 0.5s ease 2.5s forwards;
  `;

    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes slideInToast { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeOutToast { from { opacity: 1; } to { opacity: 0; } }
  `;

    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}
