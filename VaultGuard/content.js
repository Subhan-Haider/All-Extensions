// Enhanced Content Script for VaultGuard
const currentDomain = window.location.hostname;
let lastCapturedUser = '';
let lastCapturedPass = '';

// Track inputs as user types
document.addEventListener('input', (e) => {
    const target = e.target;
    if (target.type === 'password') {
        lastCapturedPass = target.value;
        // Search for nearest username field (usually just before the password)
        const allInputs = Array.from(document.querySelectorAll('input'));
        const passIdx = allInputs.indexOf(target);
        for (let i = passIdx - 1; i >= 0; i--) {
            const input = allInputs[i];
            if ((input.type === 'text' || input.type === 'email' || input.name?.includes('user') || input.id?.includes('user')) && input.value) {
                lastCapturedUser = input.value;
                break;
            }
        }
    } else if (target.type === 'text' || target.type === 'email') {
        lastCapturedUser = target.value;
    }
}, true);

// Capture when user clicks a potential "Login" button
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, input[type="submit"], input[type="button"], a.btn');
    if (!btn) return;

    const btnText = btn.innerText || btn.value || '';
    const isLoginBtn = /login|sign in|log in|submit|continue|next/i.test(btnText);

    if (isLoginBtn && lastCapturedPass) {
        // Delay slightly to ensure any JS-driven field updates are complete
        setTimeout(sendSaveMessage, 500);
    }
}, true);

// Traditional form submission fallback
document.addEventListener('submit', () => {
    if (lastCapturedPass) {
        sendSaveMessage();
    }
}, true);

function sendSaveMessage() {
    if (!lastCapturedPass) return;

    chrome.runtime.sendMessage({
        action: 'savePassword',
        data: {
            domain: currentDomain,
            username: lastCapturedUser,
            password: lastCapturedPass
        }
    });
}

// Auto-fill logic
function autoFill() {
    chrome.runtime.sendMessage({ action: 'getPasswords', domain: currentDomain }, (response) => {
        if (response && response.passwords && response.passwords.length > 0) {
            const data = response.passwords[0];
            const passwordFields = document.querySelectorAll('input[type="password"]');
            const userFields = document.querySelectorAll('input[type="text"], input[type="email"]');

            passwordFields.forEach(field => {
                if (!field.value) field.value = data.password;
            });

            userFields.forEach(field => {
                if (!field.value || field.value === data.username) {
                    field.value = data.username;
                }
            });
        }
    });
}

autoFill();
