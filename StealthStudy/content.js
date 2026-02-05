// --- StealthStudy Content Script ---

(function () {
    'use strict';

    // 1. Anti-Detection: Prevent websites from knowing when you leave the tab
    function bypassVisibility() {
        Object.defineProperty(document, 'visibilityState', {
            get: () => 'visible',
            configurable: true
        });
        Object.defineProperty(document, 'hidden', {
            get: () => false,
            configurable: true
        });

        const blockEvents = (event) => {
            event.stopImmediatePropagation();
        };

        window.addEventListener('visibilitychange', blockEvents, true);
        window.addEventListener('blur', blockEvents, true);
        window.addEventListener('mouseleave', blockEvents, true);
        window.addEventListener('focusout', blockEvents, true);
    }

    // 2. Bypass restrictions: Enable right-click and selection
    function enableRestrictions() {
        const allowSelectors = (event) => {
            event.stopImmediatePropagation();
            return true;
        };

        document.addEventListener('contextmenu', allowSelectors, true);
        document.addEventListener('selectstart', allowSelectors, true);
        document.addEventListener('copy', allowSelectors, true);
        document.addEventListener('cut', allowSelectors, true);
        document.addEventListener('paste', allowSelectors, true);
        document.addEventListener('dragstart', allowSelectors, true);

        // Some sites use CSS to disable selection
        const style = document.createElement('style');
        style.innerHTML = `
      * {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
        document.head.appendChild(style);
    }

    // 3. Tab Cloaking: Change tab title and favicon
    function cloakTab(title, iconUrl) {
        if (title) document.title = title;
        if (iconUrl) {
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = iconUrl;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }

    // 4. Ghost Overlay: A floating, draggable notepad on the page
    let ghostOverlay = null;

    function createGhostOverlay(content = "") {
        if (ghostOverlay) return;

        ghostOverlay = document.createElement('div');
        ghostOverlay.id = 'stealth-ghost-overlay';
        ghostOverlay.contentEditable = true;
        ghostOverlay.innerHTML = content || "Psst... Paste notes here. Drag me around.";

        Object.assign(ghostOverlay.style, {
            position: 'fixed',
            top: '50px',
            right: '50px',
            width: '200px',
            height: '150px',
            backgroundColor: 'rgba(10, 10, 18, 0.4)',
            backdropFilter: 'blur(5px)',
            color: 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '12px',
            zIndex: '2147483647',
            overflow: 'auto',
            cursor: 'move',
            transition: 'opacity 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            userSelect: 'text'
        });

        // Drag functionality
        let isDragging = false;
        let offset = [0, 0];

        ghostOverlay.addEventListener('mousedown', (e) => {
            isDragging = true;
            offset = [
                ghostOverlay.offsetLeft - e.clientX,
                ghostOverlay.offsetTop - e.clientY
            ];
        }, true);

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                ghostOverlay.style.left = (e.clientX + offset[0]) + 'px';
                ghostOverlay.style.top = (e.clientY + offset[1]) + 'px';
                ghostOverlay.style.right = 'auto'; // Break the right: 50px
            }
        }, true);

        document.addEventListener('mouseup', () => {
            isDragging = false;
        }, true);

        // Save notes on input
        ghostOverlay.addEventListener('input', () => {
            chrome.storage.local.set({ ghostNotes: ghostOverlay.innerHTML });
        });

        // Smart Paste: Remove source watermarks (e.g., from Chegg/CourseHero)
        ghostOverlay.addEventListener('paste', (e) => {
            e.preventDefault();
            let text = (e.originalEvent || e).clipboardData.getData('text/plain');
            // Common patterns for source attribution
            text = text.replace(/Source: https:\/\/.*$/gm, '');
            text = text.replace(/Read more at: .*$/gm, '');
            text = text.replace(/©.*$/gm, '');

            const selection = window.getSelection();
            if (!selection.rangeCount) return false;
            selection.deleteFromDocument();
            selection.getRangeAt(0).insertNode(document.createTextNode(text));

            chrome.storage.local.set({ ghostNotes: ghostOverlay.innerHTML });
        });

        // Auto-hide when mouse leaves
        ghostOverlay.addEventListener('mouseenter', () => ghostOverlay.style.opacity = '1');
        ghostOverlay.addEventListener('mouseleave', () => ghostOverlay.style.opacity = '0.4');
        ghostOverlay.style.opacity = '0.4';

        document.body.appendChild(ghostOverlay);
    }

    function toggleGhostOverlay() {
        if (ghostOverlay) {
            ghostOverlay.remove();
            ghostOverlay = null;
        } else {
            chrome.storage.local.get(['ghostNotes'], (data) => {
                createGhostOverlay(data.ghostNotes);
            });
        }
    }

    // 5. Side Search Panel: Quick Wikipedia search in an iframe side-bar
    let searchPanel = null;

    function toggleSearchPanel() {
        if (searchPanel) {
            searchPanel.remove();
            searchPanel = null;
            return;
        }

        searchPanel = document.createElement('div');
        searchPanel.id = 'stealth-search-panel';

        Object.assign(searchPanel.style, {
            position: 'fixed',
            top: '0',
            right: '0',
            width: '350px',
            height: '100%',
            backgroundColor: '#fff',
            zIndex: '2147483646',
            boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
            borderLeft: '1px solid #ddd',
            transition: 'transform 0.3s ease'
        });

        const iframe = document.createElement('iframe');
        iframe.src = "https://en.m.wikipedia.org/";
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';

        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = "×";
        Object.assign(closeBtn.style, {
            position: 'absolute',
            left: '-30px',
            top: '10px',
            width: '30px',
            height: '30px',
            backgroundColor: '#333',
            color: '#fff',
            textAlign: 'center',
            lineHeight: '30px',
            cursor: 'pointer',
            borderRadius: '5px 0 0 5px'
        });
        closeBtn.onclick = toggleSearchPanel;

        searchPanel.appendChild(closeBtn);
        searchPanel.appendChild(iframe);
        document.body.appendChild(searchPanel);
    }

    // Initialize features based on storage
    chrome.storage.local.get(['antiDetection', 'bypassRestrictions', 'tabCloak', 'cloakTitle', 'showGhost'], (data) => {
        if (data.antiDetection) {
            bypassVisibility();
        }
        if (data.bypassRestrictions) {
            enableRestrictions();
        }
        if (data.tabCloak) {
            cloakTab(data.cloakTitle || "Google Docs", "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico");
        }
        if (data.showGhost) {
            chrome.storage.local.get(['ghostNotes'], (notesData) => {
                createGhostOverlay(notesData.ghostNotes);
            });
        }
    });

    // Listen for messages from popup or background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'ping') {
            sendResponse({ status: 'alive' });
        } else if (request.action === 'panic') {
            window.location.href = "https://www.google.com/search?q=educational+resources";
        } else if (request.action === 'toggleGhost') {
            toggleGhostOverlay();
        } else if (request.action === 'toggleSearch') {
            toggleSearchPanel();
        }
    });

})();
