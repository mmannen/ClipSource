// ── Search overlay ────────────────────────────────────────────────────────────
//
// Pulls content from:
//   - localStorage key "mc_posts"  (published posts from createpost.html)
//   - A small set of static module entries representing built-in sections
//
// Each record has: { title, module, thumb }
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  const DEFAULT_EXAMPLE_ENTRIES = [
    { title: 'Bianca Ingrosso åter som programledare för Melodifestivalen 2027', module: 'Media Center', thumb: 'assets/post-1.jpg'},
    { title: 'Avsnitt 8 av Bonusfamiljen ute nu på SVT Play', module: 'Media Center', thumb: 'assets/post-2.jpg'},
    { title: 'TV4 lanserar ny dramaserie – Vinterviken hösten 2026', module: 'Media Center', thumb: 'assets/post-3.jpg'},
    { title: 'Zlatan Ibrahimović gästar Skavlan på fredag', module: 'Media Center', thumb: 'assets/post-4.jpg'},
    { title: 'Sveriges Radio P3 startar ny podd med Kodjo Akolor', module: 'Media Center', thumb: 'assets/post-5.jpg'},
  ];

  // Static module entries that always appear (representatives of each section)
  const STATIC_ENTRIES = [
    { title: 'No content yet',  module: 'Screening room',   thumb: null },
    { title: 'No content yet',  module: 'Media Bank',       thumb: null },
    { title: 'No content yet',  module: 'Website',          thumb: null },
    { title: 'No content yet',  module: 'Schedules',        thumb: null },
  ];

  const FILTER_MODULES = ['Media Center', 'Screening room', 'Media Bank', 'Website', 'Schedules'];

  let activeFilter = 'all';

  function setSearchNavActive(isActive) {
    document.querySelectorAll('.nav-links span').forEach((span) => {
      if (span.textContent.trim() === 'SEARCH') {
        span.classList.toggle('search-active', isActive);
      }
    });
  }

  function getEntries() {
    const stored = JSON.parse(localStorage.getItem('mc_posts') || '[]');
    const storedPostEntries = stored.map((p) => ({
      title:  p.title,
      module: 'Media Center',
      thumb:  p.thumb || null,
    }));

    const storedTitles = new Set(storedPostEntries.map((entry) => entry.title.toLowerCase()));
    const defaultMediaCenterEntries = DEFAULT_EXAMPLE_ENTRIES.filter(
      (entry) => !storedTitles.has(entry.title.toLowerCase())
    );

    return [...storedPostEntries, ...defaultMediaCenterEntries, ...STATIC_ENTRIES];
  }

  function getExampleEntries() {
    return DEFAULT_EXAMPLE_ENTRIES;
  }

  function buildOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'searchOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Search all modules');

    overlay.innerHTML = `
      <div class="so-header">
        <div class="so-input-wrap">
          <svg class="so-search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="6.5" stroke="#aaa" stroke-width="1.8"/>
            <path d="M13.5 13.5L18 18" stroke="#aaa" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <input class="so-input" id="soInput" type="text" placeholder="Search all modules..." autocomplete="off" />
        </div>
        <span class="so-close" id="soClose">Close &times;</span>
      </div>

      <div class="so-filters">
        <span class="so-filter-label">Filter</span>
        <div class="so-filter-tabs-row">
          <span class="so-filter-tab active" data-filter="all" style="display:none"></span>
          ${FILTER_MODULES.map((m) => `<span class="so-filter-tab" data-filter="${m}">${m}</span>`).join('')}
        </div>
      </div>

      <div class="so-results" id="soResults"></div>
    `;

    // Insert into .dashboard-wrapper right after the header, before .main-container
    const wrapper = document.querySelector('.dashboard-wrapper');
    const mainContainer = document.querySelector('.main-container');
    if (wrapper && mainContainer) {
      wrapper.insertBefore(overlay, mainContainer);
    } else {
      document.body.appendChild(overlay);
    }

    // Close
    document.getElementById('soClose').addEventListener('click', closeOverlay);
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlay(); });

    // Filter tabs
    overlay.querySelectorAll('.so-filter-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const isAlreadyActive = tab.classList.contains('active') && tab.dataset.filter !== 'all';

        overlay.querySelectorAll('.so-filter-tab').forEach((t) => t.classList.remove('active'));

        if (isAlreadyActive) {
          // Clicking an active module filter again clears the filter.
          activeFilter = 'all';
        } else {
          tab.classList.add('active');
          activeFilter = tab.dataset.filter;
        }

        renderResults(document.getElementById('soInput').value);
      });
    });

    // Input
    document.getElementById('soInput').addEventListener('input', (e) => {
      renderResults(e.target.value);
    });
  }

  function renderResults(query) {
    const resultsEl = document.getElementById('soResults');
    if (!resultsEl) return;

    const q = query.trim().toLowerCase();
    const entries = !q && activeFilter === 'all' ? getExampleEntries() : getEntries();

    const filtered = entries.filter((e) => {
      const matchesModule = activeFilter === 'all' || e.module === activeFilter;
      const matchesQuery  = !q || e.title.toLowerCase().includes(q) || e.module.toLowerCase().includes(q);
      return matchesModule && matchesQuery;
    });

    if (filtered.length === 0) {
      resultsEl.innerHTML = '<p class="so-empty">No results found.</p>';
      return;
    }

    resultsEl.innerHTML = filtered.map((e) => {
      const isEmptyEntry = e.title === 'No content yet';
      const imgTag = e.thumb
        ? `<img class="so-card-img" src="${e.thumb}" alt="" />`
        : '<div class="so-card-img-placeholder"></div>';
      if (isEmptyEntry) {
        return `
        <div class="so-card so-card-empty" data-module="${e.module}">
          <span class="so-card-title">${e.title}</span>
        </div>`;
      }
      return `
        <div class="so-card" data-module="${e.module}">
          ${imgTag}
          <div class="so-card-info">
            <span class="so-card-module">${e.module}</span>
            <span class="so-card-title">${e.title}</span>
          </div>
        </div>`;
    }).join('');

    // Card click navigates to the relevant page
    resultsEl.querySelectorAll('.so-card').forEach((card) => {
      card.addEventListener('click', () => {
        const mod = card.dataset.module;
        if (mod === 'Media Center')    window.location.href = 'medicenter.html';
        else if (mod === 'Screening room') window.location.href = 'screeningroom.html';
        else closeOverlay();
      });
    });
  }

  function openOverlay() {
    const overlay = document.getElementById('searchOverlay');
    if (!overlay) return;
    activeFilter = 'all';
    overlay.querySelectorAll('.so-filter-tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.filter === 'all');
    });
    // Hide the main page content
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) mainContainer.style.display = 'none';
    overlay.classList.add('open');
    setSearchNavActive(true);
    renderResults('');
    setTimeout(() => document.getElementById('soInput')?.focus(), 50);
  }

  function closeOverlay() {
    document.getElementById('searchOverlay')?.classList.remove('open');
    // Restore the main page content
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) mainContainer.style.display = '';
    setSearchNavActive(false);
  }

  // Wire up all SEARCH spans in top nav
  function wireSearchLinks() {
    document.querySelectorAll('.nav-links span').forEach((span) => {
      if (span.textContent.trim() === 'SEARCH') {
        span.addEventListener('click', () => {
          if (document.querySelector('.settings-page')) {
            window.location.href = 'screeningroom.html#search';
          } else {
            // Check if contacts view is currently open
            const srView = document.getElementById('sr-view');
            if (srView && srView.style.display !== 'none') {
              // Contacts are open, close them first
              if (typeof showPostsView === 'function') {
                showPostsView();
                setTimeout(() => openOverlay(), 50);
              } else {
                openOverlay();
              }
            } else {
              openOverlay();
            }
          }
        });
      }
      // Close search overlay when CONTACTS is clicked, allowing the onclick handler to fire
      if (span.textContent.trim() === 'CONTACTS') {
        const originalOnclick = span.onclick;
        span.addEventListener('click', (e) => {
          if (document.getElementById('searchOverlay')?.classList.contains('open')) {
            e.stopPropagation();
            closeOverlay();
            // Execute goToContacts after closing overlay
            if (typeof goToContacts === 'function') {
              setTimeout(() => goToContacts(), 50);
            }
          }
        }, true); // Use capture phase to intercept before inline onclick
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildOverlay();
    wireSearchLinks();
    renderResults('');
    // Auto-open if navigated here via the settings SEARCH link
    if (window.location.hash === '#search') {
      history.replaceState(null, '', window.location.pathname);
      openOverlay();
    }
  });
})();
