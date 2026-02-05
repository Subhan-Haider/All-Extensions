let favorites = [];
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  const statusContainer = document.getElementById('status-container');
  const dealsList = document.getElementById('deals-list');
  const searchInput = document.getElementById('search-input');
  const tabBtns = document.querySelectorAll('.tab-btn');

  // Load Favorites and Last Check
  const data = await chrome.storage.local.get(['favorites', 'lastCheck']);
  favorites = data.favorites || [];

  const statusEl = document.getElementById('check-status');
  if (data.lastCheck) {
    statusEl.textContent = `Auto-tracked: Last checked at ${data.lastCheck}`;
  } else {
    statusEl.textContent = 'Auto-tracking: Active every 5 min';
  }

  // 1. Get current tab and check for discounts
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        const host = url.hostname.replace('www.', '');
        const currentDeal = studentDiscounts.find(d => host.includes(d.domain));
        renderStatus(currentDeal);
      } catch (e) {
        renderStatus(null);
      }
    } else {
      renderStatus(null);
    }
  });

  // 2. Render initial deals list
  renderDeals(studentDiscounts);

  // 3. Tab Switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.tab;
      filterAndRender();
    });
  });

  // 4. Search functionality
  searchInput.addEventListener('input', () => {
    filterAndRender();
  });

  // 5. Report button
  document.getElementById('report-btn').addEventListener('click', () => {
    alert('Thank you! Our team will verify this site for student discounts.');
  });
});

function filterAndRender() {
  const term = document.getElementById('search-input').value.toLowerCase().trim();
  let filtered = studentDiscounts;

  if (currentCategory === 'fav') {
    filtered = studentDiscounts.filter(d => favorites.includes(d.id));
  } else if (currentCategory !== 'all') {
    filtered = studentDiscounts.filter(d => d.category === currentCategory);
  }

  if (term) {
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(term) ||
      d.domain.toLowerCase().includes(term) ||
      (d.category && d.category.toLowerCase().includes(term))
    );
  }

  renderDeals(filtered);
}

function renderStatus(deal) {
  const container = document.getElementById('status-container');

  if (deal) {
    container.innerHTML = `
      <div class="status-card found">
        <div class="status-icon">🎓</div>
        <div class="status-info">
          <h3>${deal.name} Discount Found!</h3>
          <p>${deal.offer}</p>
          <a href="${deal.link}" target="_blank" class="get-deal-btn">Redeem Now</a>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="status-card not-found">
        <div class="status-icon" style="color: #9ca3af; font-size: 18px;">🔍</div>
        <div class="status-info">
          <h3>Browse Student Deals</h3>
          <p>Search over 50+ handpicked student discounts.</p>
        </div>
      </div>
    `;
  }
}

function renderDeals(deals) {
  const list = document.getElementById('deals-list');
  if (deals.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; padding: 40px 20px; color: #6b7280;">
        <div style="font-size: 32px; margin-bottom: 12px;">🏜️</div>
        <div style="font-size: 14px; font-weight: 500;">No deals found here</div>
        <div style="font-size: 12px; margin-top: 4px;">Try searching for something else</div>
      </div>
    `;
    return;
  }

  list.innerHTML = '';
  deals.forEach(deal => {
    const isFav = favorites.includes(deal.id);
    const isFree = deal.category === 'Free';
    const item = document.createElement('div');
    item.className = 'deal-item';
    item.setAttribute('data-category', deal.category);
    item.innerHTML = `
      <div class="deal-main">
        <div class="deal-logo">${deal.name.charAt(0)}</div>
        <div class="deal-info">
          <div class="deal-name">
            ${deal.name}
            ${isFree ? '<span class="free-badge">Free</span>' : ''}
          </div>
          <div class="deal-offer">${deal.offer}</div>
        </div>
      </div>
      <div class="deal-actions">
        <a href="${deal.link}" target="_blank" class="action-btn" style="color: var(--primary); text-decoration: none;">Visit Store</a>
        <button class="action-btn fav-btn ${isFav ? 'active' : ''}" data-id="${deal.id}">
          ${isFav ? '★ Saved' : '☆ Save'}
        </button>
        ${deal.code ? `<span class="copy-badge">Code: ${deal.code}</span>` : ''}
      </div>
    `;

    // Add event listeners for buttons
    const favBtn = item.querySelector('.fav-btn');
    favBtn.onclick = (e) => {
      e.preventDefault();
      toggleFavorite(deal.id, favBtn);
    };

    list.appendChild(item);
  });
}

async function toggleFavorite(id, btn) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
    btn.classList.remove('active');
    btn.textContent = '☆ Save';
  } else {
    favorites.push(id);
    btn.classList.add('active');
    btn.textContent = '★ Saved';
  }
  await chrome.storage.local.set({ favorites });

  if (currentCategory === 'fav') {
    filterAndRender();
  }
}
