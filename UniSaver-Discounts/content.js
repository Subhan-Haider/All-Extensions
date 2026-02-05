chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'show_toast' && request.deal) {
        showNotification(request.deal);
    }
});

function showNotification(deal) {
    if (document.getElementById('unisaver-toast')) return;

    const toast = document.createElement('div');
    toast.id = 'unisaver-toast';

    // Styles
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: '#ffffff',
        color: '#111827',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0,0,0,0.05)',
        zIndex: '2147483647',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        width: '340px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        opacity: '0',
        transform: 'translateY(20px)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    });

    const header = document.createElement('div');
    Object.assign(header.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start'
    });

    const titleGroup = document.createElement('div');
    Object.assign(titleGroup.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    });

    const icon = document.createElement('span');
    icon.textContent = '🎓';
    icon.style.fontSize = '20px';

    const title = document.createElement('h3');
    title.textContent = `${deal.name} Discount`;
    Object.assign(title.style, {
        margin: '0',
        fontSize: '16px',
        fontWeight: '700',
        color: '#111827'
    });

    titleGroup.appendChild(icon);
    titleGroup.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        lineHeight: '1',
        color: '#9ca3af',
        cursor: 'pointer',
        padding: '0',
        margin: '-8px -4px 0 0'
    });
    closeBtn.onclick = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    };

    header.appendChild(titleGroup);
    header.appendChild(closeBtn);

    const body = document.createElement('p');
    body.textContent = deal.offer;
    Object.assign(body.style, {
        margin: '0',
        fontSize: '14px',
        lineHeight: '1.5',
        color: '#4b5563'
    });

    const actionBtn = document.createElement('a');
    actionBtn.href = deal.link;
    actionBtn.target = '_blank';
    actionBtn.textContent = 'View Deal';
    Object.assign(actionBtn.style, {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '10px',
        marginTop: '4px',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        textDecoration: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'background-color 0.2s'
    });
    actionBtn.onmouseover = () => actionBtn.style.backgroundColor = '#1d4ed8';
    actionBtn.onmouseout = () => actionBtn.style.backgroundColor = '#2563eb';

    toast.appendChild(header);
    toast.appendChild(body);
    toast.appendChild(actionBtn);

    document.body.appendChild(toast);

    // Trigger entering animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });
}
