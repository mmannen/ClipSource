(function () {
  const HELP_BY_PAGE = {
    'index.html': {
      title: 'Tips for Login',
      steps: [
        'Enter your work email to unlock the password field.',
        'Type your password and continue to verification.',
        'Use Help if you cannot access your account.'
      ],
      suggestions: {
        'How do I reset my password?': 'To reset your password, click "Forgot password?" on the login page. We\'ll send you a link to reset it via your registered email address.',
        'I cannot log in with my email': 'Make sure you\'re using your correct work email. If you still can\'t log in, check that caps lock is off and try the "Forgot password?" option.',
        'How do I contact support?': 'You can reach our support team through the help center or by sending an email to support@clipsource.com. We typically respond within 24 hours.'
      }
    },
    'verification.html': {
      title: 'Tips for Verification',
      steps: [
        'Enter the 4-digit code sent to your email.',
        'Use backspace or arrow keys to correct digits.',
        'When all digits are filled, you continue automatically.'
      ],
      suggestions: {
        'I did not receive a code': 'Check your spam folder or wait a few minutes for the email. If you still don\'t see it, click "Resend code" to receive a new one.',
        'Can I resend the verification code?': 'Yes, click the "Resend code" button on the verification page. You can request a new code as many times as needed.',
        'How long does a code stay valid?': 'Verification codes are valid for 15 minutes. After that, you\'ll need to request a new code to continue.'
      }
    },
    'screeningroom.html': {
      title: 'Tips for Screening Room',
      steps: [
        'Use the left navigation to switch between sections.',
        'Filter and search posts from the top toolbar.',
        'Open row actions from the three-dot menu to edit or manage content.'
      ],
      suggestions: {
        'How do I edit a post?': 'Click the three-dot menu on any post row and select "Edit". Make your changes and click "Save" to update the post.',
        'How do I filter highlighted posts?': 'Use the filter toolbar at the top to narrow down posts by date, category, or status. Click the filter icon to see all available options.',
        'How do I open Settings?': 'Click your profile icon in the top navigation and select "Settings" or navigate directly from the left sidebar menu.'
      }
    },
    'medicenter.html': {
      title: 'Tips for Media Center',
      steps: [
        'Browse content from Media Center items in the sidebar.',
        'Use search and filters to narrow results quickly.',
        'Create new content with the New Post button.'
      ],
      suggestions: {
        'How do I add a new post?': 'Click the "New Post" button in the toolbar. Fill in the title, category, and upload media. Then click "Publish" or "Schedule" to save.',
        'How do I publish or unpublish content?': 'Open the post from the list and click the "Publish" or "Unpublish" button in the top toolbar. Changes take effect immediately.',
        'How do I search across modules?': 'Use the search bar at the top of the page. It will search across all posts, contacts, and pages. You can also use filters to narrow results.'
      }
    },
    'createpost.html': {
      title: 'Tips for Create Post',
      steps: [
        'Add title, category, tags, and media in step 1.',
        'Set publishing and notifications in step 2.',
        'Preview in step 3, then publish or schedule.'
      ],
      suggestions: {
        'How do I upload media?': 'In step 1, click the media upload area and select files from your computer. Supports images, videos, and documents. You can upload multiple files.',
        'How do I save a draft?': 'Click "Save as draft" at any step. Your work will be saved and you can return later to continue editing.',
        'How do I schedule publishing?': 'In step 2, select "Schedule" and choose your preferred publish date and time. The post will automatically be published at that time.'
      }
    },
    'contacts.html': {
      title: 'Tips for Contacts',
      steps: [
        'Browse and manage contacts from the contacts list.',
        'Use search and filters to find contacts quickly.',
        'Edit contact information or manage groups from the menu.'
      ],
      suggestions: {
        'How do I add a new contact?': 'Click the "Add Contact" button to create a new contact. Fill in the name, email, and other details, then click "Save".',
        'How do I search for contacts?': 'Use the search bar at the top to find contacts by name, email, or organization. You can also filter by contact type or group.',
        'How do I manage contact groups?': 'Open the contact group menu to organize contacts into custom groups. You can add, edit, or remove contacts from groups as needed.'
      }
    },
    'settings.html': {
      title: 'Tips for Settings',
      steps: [
        'Switch sections from the left settings menu.',
        'Update profile and password in Account.',
        'Adjust accessibility and notifications to your preference.'
      ],
      suggestions: {
        'How do I change password?': 'Go to Account settings and click "Change password". Enter your current password and your new password twice, then click "Update".',
        'How do I update accessibility settings?': 'In the Accessibility section, you can enable features like high contrast mode, dyslexia-friendly fonts, and keyboard navigation helpers.',
        'How do I manage notifications?': 'Visit the Notifications section to choose which types of notifications you want to receive and how you\'d like to be notified.'
      }
    }
  };

  let active = null;
  let stepIndex = 0;
  let activeHelpButton = null;
  let currentView = 'main';
  let selectedQuestion = null;

  function pageName() {
    const path = window.location.pathname || '';
    return path.split('/').pop() || 'medicenter.html';
  }

  function contentForPage() {
    return HELP_BY_PAGE[pageName()] || HELP_BY_PAGE['screeningroom.html'];
  }

  function ensureOverlay() {
    let root = document.getElementById('helpOverlay');
    if (root) return root;

    root = document.createElement('div');
    root.id = 'helpOverlay';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.innerHTML = `
      <div class="ho-panel">
        <div class="ho-top">
          <div class="ho-top-row ho-main-top">
            <div class="ho-search">
              <input id="hoSearch" type="text" placeholder="Search Help Center..." autocomplete="off" />
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm9.2 14.8-3.7-3.7 1.4-1.4 3.7 3.7-1.4 1.4Z"/>
              </svg>
            </div>
            <button id="hoClose" class="ho-close" aria-label="Close help">&times;</button>
          </div>
          <div class="ho-top-row ho-detail-top" style="display: none;">
            <button id="hoBack" class="ho-back" aria-label="Back">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 19l-7-7 7-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <span id="hoDetailTitle" class="ho-detail-title"></span>
            <button id="hoClose2" class="ho-close" aria-label="Close help">&times;</button>
          </div>
        </div>

        <div class="ho-body">
          <!-- Main view -->
          <div id="hoMainView">
            <section class="ho-tip">
              <h3 id="hoTitle"></h3>
              <p id="hoText"></p>
              <div class="ho-tip-footer">
                <span id="hoStep" class="ho-step"></span>
                <button id="hoNext" class="ho-next" aria-label="Next tip">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </section>

            <section class="ho-suggestions">
              <h4>Top suggestions</h4>
              <ol id="hoList"></ol>
              <p id="hoEmpty" class="ho-empty" hidden>No suggestions found.</p>
            </section>
          </div>

          <!-- Detail view -->
          <div id="hoDetailView" style="display: none;">
            <section class="ho-article">
              <div class="ho-article-header">
                <h2 id="hoArticleTitle"></h2>
              </div>
              <div id="hoArticleContent" class="ho-article-content"></div>
            </section>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    document.getElementById('hoClose').addEventListener('click', closeOverlay);
    document.getElementById('hoClose2').addEventListener('click', closeOverlay);
    document.getElementById('hoNext').addEventListener('click', nextStep);
    document.getElementById('hoBack').addEventListener('click', backToMain);
    document.getElementById('hoSearch').addEventListener('input', renderSuggestions);

    root.addEventListener('click', (e) => {
      if (e.target === root) closeOverlay();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeOverlay();
    });

    return root;
  }

  function renderStep() {
    if (!active) return;
    document.getElementById('hoTitle').textContent = active.title;
    document.getElementById('hoText').textContent = active.steps[stepIndex] || '';
    document.getElementById('hoStep').textContent = `Step ${stepIndex + 1} of ${active.steps.length}`;

    const nextBtn = document.getElementById('hoNext');
    if (!nextBtn) return;

    const isLastStep = stepIndex === active.steps.length - 1;
    if (isLastStep) {
      nextBtn.classList.add('is-learn-more');
      nextBtn.textContent = 'Learn more';
    } else {
      nextBtn.classList.remove('is-learn-more');
      nextBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
  }

  function renderSuggestions() {
    if (!active) return;
    const query = (document.getElementById('hoSearch').value || '').trim().toLowerCase();
    const suggestionsObj = active.suggestions;
    const keys = Object.keys(suggestionsObj);
    const items = keys.filter((item) => !query || item.toLowerCase().includes(query));

    const list = document.getElementById('hoList');
    const empty = document.getElementById('hoEmpty');

    list.innerHTML = items.map((item) => `<li class="ho-suggestion-item" data-question="${item}">${item}</li>`).join('');
    empty.hidden = items.length > 0;

    // Add click listeners to suggestion items
    document.querySelectorAll('.ho-suggestion-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const question = e.currentTarget.getAttribute('data-question');
        showDetailView(question);
      });
    });
  }

  function showDetailView(question) {
    if (!active || !active.suggestions[question]) return;

    selectedQuestion = question;
    currentView = 'detail';

    const title = document.getElementById('hoArticleTitle');
    const content = document.getElementById('hoArticleContent');
    const detailTitle = document.getElementById('hoDetailTitle');

    title.textContent = question;
    detailTitle.textContent = question;
    content.textContent = active.suggestions[question];

    document.getElementById('hoMainView').style.display = 'none';
    document.getElementById('hoDetailView').style.display = 'block';
    document.querySelector('.ho-main-top').style.display = 'none';
    document.querySelector('.ho-detail-top').style.display = 'flex';
  }

  function backToMain() {
    currentView = 'main';
    selectedQuestion = null;

    document.getElementById('hoMainView').style.display = 'block';
    document.getElementById('hoDetailView').style.display = 'none';
    document.querySelector('.ho-main-top').style.display = 'flex';
    document.querySelector('.ho-detail-top').style.display = 'none';
  }

  function nextStep() {
    if (!active) return;
    const isLastStep = stepIndex === active.steps.length - 1;
    if (isLastStep) {
      window.open('https://help.clipsource.com/hc/en-us', '_blank');
      return;
    }

    stepIndex += 1;
    renderStep();
  }

  function openOverlay() {
    active = contentForPage();
    stepIndex = 0;
    currentView = 'main';
    selectedQuestion = null;

    const root = ensureOverlay();
    const panel = root.querySelector('.ho-panel');
    const helpBtn = document.getElementById('helpBtn');

    positionPanelFromButton(panel, helpBtn);
    root.classList.add('open');

    activeHelpButton = helpBtn || null;
    if (activeHelpButton) activeHelpButton.style.visibility = 'hidden';

    // Reset view to main
    document.getElementById('hoMainView').style.display = 'block';
    document.getElementById('hoDetailView').style.display = 'none';
    document.querySelector('.ho-main-top').style.display = 'flex';
    document.querySelector('.ho-detail-top').style.display = 'none';

    renderStep();
    const searchInput = document.getElementById('hoSearch');
    searchInput.value = '';
    renderSuggestions();
    searchInput.focus();
  }

  function closeOverlay() {
    const root = document.getElementById('helpOverlay');
    if (root) root.classList.remove('open');

    if (activeHelpButton) {
      activeHelpButton.style.visibility = '';
      activeHelpButton = null;
    }
  }

  function positionPanelFromButton(panel, helpBtn) {
    if (!panel) return;

    const panelWidth = 350;
    const panelHeight = 550;
    const margin = 12;

    if (!helpBtn) {
      panel.style.left = `${Math.max(margin, window.innerWidth - panelWidth - margin)}px`;
      panel.style.top = `${Math.max(margin, window.innerHeight - panelHeight - margin)}px`;
      return;
    }

    const rect = helpBtn.getBoundingClientRect();
    let left = rect.right - panelWidth;
    let top = rect.bottom - panelHeight;

    left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - panelHeight - margin));

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  function wireHelpButtons() {
    const buttons = document.querySelectorAll('#helpBtn, .help-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        openOverlay();
      }, true);
    });

    window.addEventListener('resize', () => {
      const root = document.getElementById('helpOverlay');
      if (!root || !root.classList.contains('open')) return;
      const panel = root.querySelector('.ho-panel');
      positionPanelFromButton(panel, activeHelpButton || document.getElementById('helpBtn'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireHelpButtons);
  } else {
    wireHelpButtons();
  }
})();
