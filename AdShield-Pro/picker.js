// Element Picker for AdShield Pro
(function () {
    if (window.adShieldPickerActive) return;
    window.adShieldPickerActive = true;

    const style = document.createElement('style');
    style.id = 'adshield-picker-styles';
    style.textContent = `
        .adshield-picker-highlight {
            outline: 3px solid #764ba2 !important;
            outline-offset: -3px !important;
            cursor: crosshair !important;
            background-color: rgba(118, 75, 162, 0.2) !important;
            transition: all 0.1s ease !important;
            position: relative !important;
            z-index: 2147483646 !important;
        }
        #adshield-picker-ui {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1a1a2e;
            color: white;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            z-index: 2147483647;
            font-family: 'Inter', sans-serif;
            border: 1px solid rgba(255,255,255,0.1);
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 250px;
            animation: adshield-slide-up 0.3s ease-out;
        }
        @keyframes adshield-slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .adshield-picker-title {
            font-weight: 700;
            font-size: 14px;
            color: #667eea;
            margin-bottom: 5px;
        }
        .adshield-picker-desc {
            font-size: 12px;
            color: #a0aec0;
        }
        .adshield-picker-btns {
            display: flex;
            gap: 8px;
            margin-top: 5px;
        }
        .adshield-picker-btn {
            flex: 1;
            padding: 8px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 12px;
            transition: all 0.2s;
        }
        .adshield-btn-cancel {
            background: #2d3748;
            color: white;
        }
        .adshield-btn-confirm {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .adshield-picker-btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(style);

    const ui = document.createElement('div');
    ui.id = 'adshield-picker-ui';
    ui.innerHTML = `
        <div class="adshield-picker-title">✨ Element Picker</div>
        <div class="adshield-picker-desc" id="adshield-picker-info">Hover and click an element to block it.</div>
        <div class="adshield-picker-btns">
            <button class="adshield-picker-btn adshield-btn-cancel" id="adshield-cancel">Cancel</button>
            <button class="adshield-picker-btn adshield-btn-confirm" id="adshield-confirm" style="display:none">Block Element</button>
        </div>
    `;
    document.body.appendChild(ui);

    let hoveredElement = null;
    let selectedElement = null;

    function onMouseMove(e) {
        if (selectedElement) return;

        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || el.id === 'adshield-picker-ui' || ui.contains(el)) return;

        if (hoveredElement !== el) {
            if (hoveredElement) hoveredElement.classList.remove('adshield-picker-highlight');
            hoveredElement = el;
            hoveredElement.classList.add('adshield-picker-highlight');
        }
    }

    function onClick(e) {
        e.preventDefault();
        e.stopPropagation();

        if (selectedElement) return;

        selectedElement = hoveredElement;
        document.getElementById('adshield-picker-info').textContent = "Selected: " + (selectedElement.tagName.toLowerCase()) + (selectedElement.className ? '.' + selectedElement.className.split(' ')[0] : '');
        document.getElementById('adshield-confirm').style.display = 'block';
    }

    function cleanup() {
        if (hoveredElement) hoveredElement.classList.remove('adshield-picker-highlight');
        style.remove();
        ui.remove();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('click', onClick, true);
        window.adShieldPickerActive = false;
    }

    document.getElementById('adshield-cancel').onclick = cleanup;

    document.getElementById('adshield-confirm').onclick = () => {
        if (selectedElement) {
            const selector = generateSelector(selectedElement);
            // Store the rule
            chrome.runtime.sendMessage({
                action: 'saveCustomRule',
                rule: selector,
                hostname: window.location.hostname
            });
            selectedElement.style.display = 'none';
            cleanup();
        }
    };

    function generateSelector(el) {
        if (el.id) return `#${el.id}`;
        let selector = el.tagName.toLowerCase();
        if (el.className) {
            const classes = Array.from(el.classList).filter(c => !c.startsWith('adshield')).join('.');
            if (classes) selector += `.${classes.split(' ')[0]}`;
        }
        return selector;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick, true);

})();
