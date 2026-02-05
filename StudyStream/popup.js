// --- Mock Chrome API for local preview ---
if (typeof chrome === 'undefined' || !chrome.storage) {
    window.chrome = {
        storage: {
            local: {
                get: (keys, cb) => cb({
                    tasks: [
                        { id: 1, text: 'Study for Midterms', date: '2026-02-15', completed: false },
                        { id: 2, text: 'Submit Chemistry Lab', date: '2026-01-30', completed: true }
                    ],
                    clippings: [
                        { text: 'Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.', source: 'wikipedia.org' }
                    ],
                    blockerEnabled: true,
                    notes: 'This is a test note.',
                    stats: { sessions: 5, minutes: 125 }
                }),
                set: (data, cb) => {
                    console.log('Mock storage set:', data);
                    cb && cb();
                }
            }
        },
        runtime: {
            sendMessage: (msg) => console.log('Mock sendMessage:', msg)
        },
        notifications: {
            create: (id, opt) => console.log('Mock Notification:', opt)
        }
    };
}

// --- State Management ---
let state = {
    timer: {
        minutes: 25,
        seconds: 0,
        isRunning: false,
        currentMode: 25,
        interval: null
    },
    activeTab: 'timer',
    sounds: {
        rain: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-rain-moderate-loop-2393.mp3'),
        lofi: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
        forest: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-forest-bird-chirping-loop-1210.mp3')
    },
    currentSound: null
};

state.sounds.rain.loop = true;
state.sounds.lofi.loop = true;
state.sounds.forest.loop = true;

// --- DOM Elements ---
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const progressRing = document.querySelector('.progress-ring__circle');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const modeBtns = document.querySelectorAll('.mode-btn');
const taskContainer = document.getElementById('task-container');
const vaultContainer = document.getElementById('clippings-container');
const addBtn = document.getElementById('add-task-btn');
const modal = document.getElementById('task-modal');
const saveTaskBtn = document.getElementById('save-task');
const cancelTaskBtn = document.getElementById('cancel-task');
const blockerToggle = document.getElementById('blocker-toggle');
const notesTextarea = document.getElementById('notes-textarea');
const saveStatus = document.getElementById('save-status');
const soundBtns = document.querySelectorAll('.sound-btn');
const sessionsStat = document.getElementById('stats-sessions');
const minutesStat = document.getElementById('stats-minutes');

const radius = 90;
const circumference = 2 * Math.PI * radius;
progressRing.style.strokeDasharray = `${circumference} ${circumference}`;

// --- Timer Logic ---
function updateTimerDisplay() {
    minutesEl.textContent = String(state.timer.minutes).padStart(2, '0');
    secondsEl.textContent = String(state.timer.seconds).padStart(2, '0');

    const totalSeconds = state.timer.currentMode * 60;
    const remainingSeconds = (state.timer.minutes * 60) + state.timer.seconds;
    const offset = circumference - (remainingSeconds / totalSeconds) * circumference;
    progressRing.style.strokeDashoffset = offset;
}

function startTimer() {
    if (state.timer.isRunning) {
        clearInterval(state.timer.interval);
        startBtn.textContent = 'Resume';
        state.timer.isRunning = false;
    } else {
        state.timer.isRunning = true;
        startBtn.textContent = 'Pause';
        state.timer.interval = setInterval(() => {
            if (state.timer.seconds === 0) {
                if (state.timer.minutes === 0) {
                    clearInterval(state.timer.interval);
                    updateStats(state.timer.currentMode);
                    playAlarm();
                    resetTimer();
                    return;
                }
                state.timer.minutes--;
                state.timer.seconds = 59;
            } else {
                state.timer.seconds--;
            }
            updateTimerDisplay();
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(state.timer.interval);
    state.timer.isRunning = false;
    state.timer.minutes = state.timer.currentMode;
    state.timer.seconds = 0;
    startBtn.textContent = 'Start Session';
    updateTimerDisplay();
}

function playAlarm() {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
    audio.play();
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'StudyStream',
        message: 'Session Complete! Take a well-deserved break.'
    });
}

function updateStats(minutes) {
    chrome.storage.local.get(['stats'], (result) => {
        const stats = result.stats || { sessions: 0, minutes: 0 };
        stats.sessions += 1;
        stats.minutes += minutes;
        chrome.storage.local.set({ stats }, renderStats);
    });
}

function renderStats() {
    chrome.storage.local.get(['stats'], (result) => {
        const stats = result.stats || { sessions: 0, minutes: 0 };
        sessionsStat.textContent = stats.sessions;
        minutesStat.textContent = stats.minutes;
    });
}

// --- Tab Logic ---
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const time = parseInt(btn.getAttribute('data-time'));
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.timer.currentMode = time;
        resetTimer();
    });
});

// --- Soundscape Logic ---
soundBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const soundType = btn.getAttribute('data-sound');

        // Stop current sound
        if (state.currentSound) {
            state.sounds[state.currentSound].pause();
            state.sounds[state.currentSound].currentTime = 0;
        }

        soundBtns.forEach(b => b.classList.remove('active'));

        if (state.currentSound === soundType || soundType === 'none') {
            state.currentSound = null;
            if (soundType !== 'none') btn.classList.remove('active');
        } else {
            state.currentSound = soundType;
            state.sounds[soundType].play();
            btn.classList.add('active');
        }
    });
});

// --- Notes Logic ---
let saveTimeout;
notesTextarea.addEventListener('input', () => {
    saveStatus.classList.remove('visible');
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        const notes = notesTextarea.value;
        chrome.storage.local.set({ notes }, () => {
            saveStatus.classList.add('visible');
            setTimeout(() => saveStatus.classList.remove('visible'), 2000);
        });
    }, 1000);
});

function loadNotes() {
    chrome.storage.local.get(['notes'], (result) => {
        notesTextarea.value = result.notes || '';
    });
}

// --- Tasks Logic ---
addBtn.addEventListener('click', () => modal.classList.add('active'));
cancelTaskBtn.addEventListener('click', () => modal.classList.remove('active'));

saveTaskBtn.addEventListener('click', () => {
    const taskText = document.getElementById('task-input').value;
    const taskDate = document.getElementById('date-input').value;
    if (taskText) {
        chrome.storage.local.get(['tasks'], (result) => {
            const tasks = result.tasks || [];
            tasks.push({ id: Date.now(), text: taskText, date: taskDate, completed: false });
            chrome.storage.local.set({ tasks }, renderTasks);
        });
        modal.classList.remove('active');
        document.getElementById('task-input').value = '';
    }
});

function renderTasks() {
    chrome.storage.local.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        if (tasks.length === 0) {
            taskContainer.innerHTML = '<div class="empty-state">No pending deadlines. Add one!</div>';
            return;
        }
        taskContainer.innerHTML = tasks.map(t => `
      <div class="task-item">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600;">${t.text}</div>
            <div style="font-size:10px; color:var(--text-dim);">${t.date || 'No deadline'}</div>
          </div>
          <button class="delete-btn" data-id="${t.id}">
             <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
    `).join('');
    });
}

taskContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-btn');
    if (btn) {
        const id = parseInt(btn.getAttribute('data-id'));
        chrome.storage.local.get(['tasks'], (result) => {
            const tasks = (result.tasks || []).filter(t => t.id !== id);
            chrome.storage.local.set({ tasks }, renderTasks);
        });
    }
});

// Task deletion moved to event delegation above

// --- Vault Logic ---
function renderVault() {
    chrome.storage.local.get(['clippings'], (result) => {
        const clippings = result.clippings || [];
        document.getElementById('clippings-count').textContent = `${clippings.length} items`;
        if (clippings.length === 0) {
            vaultContainer.innerHTML = '<div class="empty-state">Highlight text on any page and click "Save to StudyStream" to add to your vault.</div>';
            return;
        }
        vaultContainer.innerHTML = clippings.map(c => `
      <div class="clipping-item">
        <div style="font-size:12px; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">"${c.text}"</div>
        <div style="font-size:10px; color:var(--primary); font-weight:600;">${c.source}</div>
      </div>
    `).join('');

        if (clippings.length > 0 && !document.getElementById('export-vault')) {
            const exportBtn = document.createElement('button');
            exportBtn.id = 'export-vault';
            exportBtn.className = 'secondary-btn';
            exportBtn.style.width = '100%';
            exportBtn.style.marginTop = '10px';
            exportBtn.textContent = 'Export to Markdown';
            exportBtn.onclick = () => exportVault(clippings); // Note: onclick is okay here because it's set via JS, but better to use addEventListener
            vaultContainer.appendChild(exportBtn);
        }
    });
}

function exportVault(clippings) {
    const markdown = clippings.map(c => `## ${c.source}\n\n> ${c.text}\n\n[Source](${c.url})\n\n---\n`).join('\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'StudyStream_Research.md';
    a.click();
}

// --- Blocker Toggle ---
blockerToggle.addEventListener('change', (e) => {
    chrome.runtime.sendMessage({ type: 'toggleBlocker', enabled: e.target.checked });
});

// --- Initialize ---
startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);
updateTimerDisplay();
renderTasks();
renderVault();
renderStats();
loadNotes();
chrome.storage.local.get(['blockerEnabled'], (res) => {
    blockerToggle.checked = !!res.blockerEnabled;
});
