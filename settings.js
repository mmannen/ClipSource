function logout() {
  sessionStorage.removeItem('clipsource_login_password');
  window.location.href = 'index.html';
}

function goToHome() {
  window.location.href = 'screeningroom.html';
}

function goToContacts() {
  // Navigate to screeningroom to show contacts panel
  sessionStorage.setItem('showContactsPanelOnLoad', 'true');
  window.location.href = "screeningroom.html";
}

function goToTags() {
  window.location.href = "tags.html";
}

function goToSettings() {
  window.location.href = "settings.html";
}

function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(password);
}

function getLoggedInPassword() {
  return sessionStorage.getItem('clipsource_login_password') || '';
}

function setPasswordFeedback(feedbackEl, message, type) {
  feedbackEl.textContent = message;
  feedbackEl.classList.remove('is-error', 'is-success');
  if (type) {
    feedbackEl.classList.add(type === 'error' ? 'is-error' : 'is-success');
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1700);
}

const A11Y_STORAGE_KEY = 'clipsource_accessibility_settings';
const CONTACT_CARDS_STORAGE_KEY = 'clipsource_contact_cards';

const DEFAULT_A11Y_SETTINGS = {
  textSize: 'default',
  contrast: 'off',
};

function readA11ySettings() {
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_A11Y_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_A11Y_SETTINGS, ...parsed };
  } catch (_error) {
    return { ...DEFAULT_A11Y_SETTINGS };
  }
}

function writeA11ySettings(settings) {
  localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(settings));
}

function applyA11ySettingsToPage(settings) {
  const sizeValue = settings.textSize || 'default';
  
  // Remove old style if it exists
  const oldStyle = document.getElementById('a11y-font-scale');
  if (oldStyle) oldStyle.remove();

  // At default, don't apply any scaling - preserve original layout exactly
  if (sizeValue === 'default') {
    document.body.setAttribute('data-text-size', 'default');
    document.body.classList.toggle('a11y-high-contrast', settings.contrast === 'on');
    return;
  }

  const scaleMap = {
    small: 0.875,      // 14px / 16px
    large: 1.125       // 18px / 16px
  };

  const scale = scaleMap[sizeValue] || 1;

  const style = document.createElement('style');
  style.id = 'a11y-font-scale';
  
  // Apply scaling multiplier to text elements
  style.textContent = `
    /* Scale basic text elements relative to body */
    p, span, strong, em, b, i, mark, small, del, ins, sub, sup, u, s,
    a, li, label, input, textarea, select, option,
    td, th, caption, legend, fieldset {
      font-size: calc(1em * ${scale}) !important;
    }
    
    /* Scale headings relative to their original sizes */
    h1, h2, h3, h4, h5, h6 {
      font-size: calc(1em * ${scale}) !important;
    }
    
    /* Scale specific heading and paragraph classes */
    .tab-pane h2 {
      font-size: calc(18px * ${scale}) !important;
    }
    
    .a11y-section h3 {
      font-size: calc(16px * ${scale}) !important;
    }
    
    .intro {
      font-size: calc(16px * ${scale}) !important;
    }
    
    /* Scale specific heading classes - scale from their original pixel values */
    .page-title {
      font-size: calc(24px * ${scale}) !important;
    }
    
    .settings-title {
      font-size: calc(20px * ${scale}) !important;
    }
    
    .verification-subtitle {
      font-size: calc(18px * ${scale}) !important;
    }
    
    /* Accordion titles - override clamp() with fixed scaled values */
    .acc-title {
      font-size: calc(18px * ${scale}) !important;
    }
    
    /* Accordion titles when open (larger size) - scale from their original size */
    .accordion-section.is-open > .acc-header .acc-title {
      font-size: calc(20px * ${scale}) !important;
    }
    
    .menu-item,
    .menu-item span {
      font-size: calc(16px * ${scale}) !important;
    }
    
    button {
      font-size: calc(1em * ${scale}) !important;
    }
  `;
  
  document.head.appendChild(style);
  document.body.setAttribute('data-text-size', sizeValue);

  document.body.classList.toggle('a11y-high-contrast', settings.contrast === 'on');
}

function syncA11yControls(settings) {
  const controlMap = [
    { name: 'a11yTextSize', value: settings.textSize },
    { name: 'a11yContrast', value: settings.contrast },
  ];

  controlMap.forEach(({ name, value }) => {
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
  });
}

function setupA11yControls() {
  const settings = readA11ySettings();
  syncA11yControls(settings);
  applyA11ySettingsToPage(settings);

  const controls = document.querySelectorAll(
    'input[name="a11yTextSize"], input[name="a11yContrast"]'
  );

  controls.forEach((input) => {
    input.addEventListener('change', () => {
      const updated = {
        textSize: document.querySelector('input[name="a11yTextSize"]:checked')?.value || 'default',
        contrast: document.querySelector('input[name="a11yContrast"]:checked')?.value || 'off',
      };

      writeA11ySettings(updated);
      applyA11ySettingsToPage(updated);
    });
  });
}

function getPasswordValidationError(currentPassword, newPassword, repeatPassword) {
  const loggedInPassword = getLoggedInPassword();

  if (!currentPassword && !newPassword && !repeatPassword) {
    return '';
  }

  if (currentPassword && loggedInPassword && currentPassword !== loggedInPassword) {
    return 'Wrong current password.';
  }

  if (newPassword && !isStrongPassword(newPassword)) {
    return 'New password must be at least 12 characters and include uppercase, lowercase, number, and special character.';
  }

  if (repeatPassword && newPassword !== repeatPassword) {
    return 'Passwords do not match.';
  }

  if (currentPassword && newPassword && newPassword === currentPassword) {
    return 'New password must be different from current password.';
  }

  return '';
}

function readContactCards() {
  const fallback = [
    {
      id: 'martin-linden',
      linkUser: '',
      name: 'Martin Linden',
      description: '',
      section: 'Main contact',
      urlText: '',
      url: '',
      role: '',
      email: 'martin.linden@clipsource.com',
      telephone: '',
      mobile: '',
      twitter: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      tiktok: '',
      showPhone: false,
      includeImage: true,
    },
  ];

  try {
    const raw = localStorage.getItem(CONTACT_CARDS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeContactCards(cards) {
  localStorage.setItem(CONTACT_CARDS_STORAGE_KEY, JSON.stringify(cards));
}

document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.menu-item');
  const panes = document.querySelectorAll('.tab-pane');
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  const phoneFlag = document.getElementById('phoneFlag');
  const phoneInput = document.getElementById('phoneInput');
  const helpBtn = document.getElementById('helpBtn');
  const contactCardsList = document.getElementById('contactCardsList');
  const contactCardForm = document.getElementById('contactCardForm');
  const ccSubmitBtn = document.getElementById('ccSubmitBtn');
  const ccFormTitle = document.getElementById('ccFormTitle');
  const contactCardsListPage = document.getElementById('contactCardsListPage');
  const contactCardsFormPage = document.getElementById('contactCardsFormPage');
  const openCreateContactCardBtn = document.getElementById('openCreateContactCardBtn');
  const backToContactCardsBtn = document.getElementById('backToContactCardsBtn');

  const ccLinkUser = document.getElementById('ccLinkUser');
  const ccName = document.getElementById('ccName');
  const ccDescription = document.getElementById('ccDescription');
  const ccUrlText = document.getElementById('ccUrlText');
  const ccUrl = document.getElementById('ccUrl');
  const ccRole = document.getElementById('ccRole');
  const ccEmail = document.getElementById('ccEmail');
  const ccTelephone = document.getElementById('ccTelephone');
  const ccMobile = document.getElementById('ccMobile');
  const ccTwitter = document.getElementById('ccTwitter');
  const ccFacebook = document.getElementById('ccFacebook');
  const ccInstagram = document.getElementById('ccInstagram');
  const ccLinkedIn = document.getElementById('ccLinkedIn');
  const ccTikTok = document.getElementById('ccTikTok');
  const ccShowPhone = document.getElementById('ccShowPhone');
  const ccIncludeImage = document.getElementById('ccIncludeImage');

  let contactCards = readContactCards();
  let editingContactId = null;

  const showContactCardsListPage = () => {
    if (contactCardsListPage) contactCardsListPage.classList.add('cc-page-active');
    if (contactCardsFormPage) contactCardsFormPage.classList.remove('cc-page-active');
  };

  const showContactCardsFormPage = () => {
    if (contactCardsListPage) contactCardsListPage.classList.remove('cc-page-active');
    if (contactCardsFormPage) contactCardsFormPage.classList.add('cc-page-active');
  };

  const resetContactForm = () => {
    if (!contactCardForm) return;
    contactCardForm.reset();
    const sectionInput = document.querySelector('input[name="ccSection"][value="Main contact"]');
    if (sectionInput) sectionInput.checked = true;
    if (ccIncludeImage) ccIncludeImage.checked = true;
    if (ccShowPhone) ccShowPhone.checked = false;
    editingContactId = null;
    if (ccSubmitBtn) ccSubmitBtn.textContent = 'Create contact card';
    if (ccFormTitle) ccFormTitle.textContent = 'Create contact card';
  };

  const setContactFormValues = (contact) => {
    if (!contact) return;
    if (ccLinkUser) ccLinkUser.value = contact.linkUser || '';
    if (ccName) ccName.value = contact.name || '';
    if (ccDescription) ccDescription.value = contact.description || '';
    if (ccUrlText) ccUrlText.value = contact.urlText || '';
    if (ccUrl) ccUrl.value = contact.url || '';
    if (ccRole) ccRole.value = contact.role || '';
    if (ccEmail) ccEmail.value = contact.email || '';
    if (ccTelephone) ccTelephone.value = contact.telephone || '';
    if (ccMobile) ccMobile.value = contact.mobile || '';
    if (ccTwitter) ccTwitter.value = contact.twitter || '';
    if (ccFacebook) ccFacebook.value = contact.facebook || '';
    if (ccInstagram) ccInstagram.value = contact.instagram || '';
    if (ccLinkedIn) ccLinkedIn.value = contact.linkedin || '';
    if (ccTikTok) ccTikTok.value = contact.tiktok || '';
    if (ccShowPhone) ccShowPhone.checked = Boolean(contact.showPhone);
    if (ccIncludeImage) ccIncludeImage.checked = Boolean(contact.includeImage);

    const sectionInput = document.querySelector(`input[name="ccSection"][value="${contact.section || 'Main contact'}"]`);
    if (sectionInput) sectionInput.checked = true;
  };

  const renderContactCardsList = () => {
    if (!contactCardsList) return;
    contactCardsList.innerHTML = '';

    contactCards.forEach((contact) => {
      const item = document.createElement('div');
      item.className = 'cc-list-item';
      item.innerHTML = `
        <button type="button" class="cc-list-name" data-edit-id="${contact.id}">${contact.name || 'Unnamed contact'}</button>
        <button type="button" class="cc-list-delete" data-delete-id="${contact.id}">Delete</button>
      `;
      contactCardsList.appendChild(item);
    });
  };

  if (contactCardsList) {
    contactCardsList.addEventListener('click', (event) => {
      const editBtn = event.target.closest('[data-edit-id]');
      const deleteBtn = event.target.closest('[data-delete-id]');

      if (editBtn) {
        const id = editBtn.dataset.editId;
        const contact = contactCards.find((entry) => String(entry.id) === String(id));
        if (!contact) return;
        editingContactId = id;
        setContactFormValues(contact);
        if (ccSubmitBtn) ccSubmitBtn.textContent = 'Save contact card';
        if (ccFormTitle) ccFormTitle.textContent = 'Edit contact card';
        showContactCardsFormPage();
        return;
      }

      if (deleteBtn) {
        const id = deleteBtn.dataset.deleteId;
        contactCards = contactCards.filter((entry) => String(entry.id) !== String(id));
        writeContactCards(contactCards);
        renderContactCardsList();
        if (String(editingContactId) === String(id)) {
          resetContactForm();
        }
      }
    });
  }

  if (contactCardForm) {
    contactCardForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const payload = {
        id: editingContactId || String(Date.now()),
        linkUser: ccLinkUser?.value.trim() || '',
        name: ccName?.value.trim() || '',
        description: ccDescription?.value.trim() || '',
        section: document.querySelector('input[name="ccSection"]:checked')?.value || 'Main contact',
        urlText: ccUrlText?.value.trim() || '',
        url: ccUrl?.value.trim() || '',
        role: ccRole?.value.trim() || '',
        email: ccEmail?.value.trim() || '',
        telephone: ccTelephone?.value.trim() || '',
        mobile: ccMobile?.value.trim() || '',
        twitter: ccTwitter?.value.trim() || '',
        facebook: ccFacebook?.value.trim() || '',
        instagram: ccInstagram?.value.trim() || '',
        linkedin: ccLinkedIn?.value.trim() || '',
        tiktok: ccTikTok?.value.trim() || '',
        showPhone: Boolean(ccShowPhone?.checked),
        includeImage: Boolean(ccIncludeImage?.checked),
      };

      if (!payload.name) {
        showToast('Name is required.');
        return;
      }

      if (editingContactId) {
        contactCards = contactCards.map((entry) => (String(entry.id) === String(editingContactId) ? payload : entry));
        showToast('Contact card updated.');
      } else {
        contactCards.unshift(payload);
        showToast('Contact card created.');
      }

      writeContactCards(contactCards);
      renderContactCardsList();
      resetContactForm();
      showContactCardsListPage();
    });
  }

  openCreateContactCardBtn?.addEventListener('click', () => {
    resetContactForm();
    showContactCardsFormPage();
  });

  backToContactCardsBtn?.addEventListener('click', () => {
    showContactCardsListPage();
  });

  document.getElementById('ccCreateSectionBtn')?.addEventListener('click', () => {
    showToast('Create section coming soon.');
  });

  renderContactCardsList();
  resetContactForm();
  showContactCardsListPage();

  menuItems.forEach((item) => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;

      menuItems.forEach((btn) => btn.classList.remove('active'));
      panes.forEach((pane) => pane.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(`tab-${tab}`)?.classList.add('active');

      if (tab === 'contact') {
        showContactCardsListPage();
      }
    });
  });

  togglePasswordButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;

      const shouldShow = input.type === 'password';
      input.type = shouldShow ? 'text' : 'password';
      button.classList.toggle('is-visible', shouldShow);

      const labelMode = shouldShow ? 'Hide' : 'Show';
      const readableName = targetId.replace(/([A-Z])/g, ' $1').toLowerCase();
      button.setAttribute('aria-label', `${labelMode} ${readableName}`);
    });
  });

  const getCountryFromPhone = (value) => {
    const trimmed = value.trim();
    if (trimmed.startsWith('+358')) return 'fi';
    if (trimmed.startsWith('+47')) return 'no';
    if (trimmed.startsWith('+46')) return 'se';
    if (trimmed.startsWith('+45')) return 'dk';
    return 'se';
  };

  const syncFlagAndCountry = (countryCode) => {
    if (!phoneFlag) return;
    phoneFlag.className = `flag-indicator flag-${countryCode}`;
  };

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      syncFlagAndCountry(getCountryFromPhone(phoneInput.value));
    });
  }

  if (phoneInput) {
    syncFlagAndCountry(getCountryFromPhone(phoneInput.value));
  }

  if (helpBtn) {
    helpBtn.addEventListener('click', () => showToast('Need help? contact support.'));
  }

  const confirmBtn = document.getElementById('confirmBtn');
  const feedbackEl = document.getElementById('passwordFeedback');
  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const repeatPasswordInput = document.getElementById('repeatPassword');

  if (confirmBtn && feedbackEl && currentPasswordInput && newPasswordInput && repeatPasswordInput) {
    const validateLive = () => {
      const currentPassword = currentPasswordInput.value.trim();
      const newPassword = newPasswordInput.value.trim();
      const repeatPassword = repeatPasswordInput.value.trim();
      const error = getPasswordValidationError(currentPassword, newPassword, repeatPassword);

      if (error) {
        setPasswordFeedback(feedbackEl, error, 'error');
      } else {
        setPasswordFeedback(feedbackEl, '', null);
      }
    };

    [currentPasswordInput, newPasswordInput, repeatPasswordInput].forEach((input) => {
      input.addEventListener('input', validateLive);
      input.addEventListener('blur', validateLive);
    });

    confirmBtn.addEventListener('click', (event) => {
      event.preventDefault();

      const currentPassword = currentPasswordInput.value.trim();
      const newPassword = newPasswordInput.value.trim();
      const repeatPassword = repeatPasswordInput.value.trim();

      const error = getPasswordValidationError(currentPassword, newPassword, repeatPassword);
      if (error) {
        setPasswordFeedback(feedbackEl, error, 'error');
        return;
      }

      setPasswordFeedback(feedbackEl, 'Information saved.', 'success');
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
      repeatPasswordInput.value = '';
    });
  }

  setupA11yControls();
});
