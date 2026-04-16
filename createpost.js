document.addEventListener('DOMContentLoaded', () => {
  // ──── Extract edit parameters from URL ────
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('editId');
  const isTempEdit = params.get('editTemp') === '1';

  // ──── Category Dropdown Setup ────
  const cpCategoryDropdown = document.getElementById('cpCategoryDropdown');
  const cpCategoryLabel = document.getElementById('cpCategoryLabel');
  const cpCategoryMenu = document.getElementById('cpCategoryMenu');
  let selectedCategory = 'highlights';
  let selectedHighlightsDays = 7;
  let selectedHighlightDate = null;

  if (cpCategoryDropdown) {
    cpCategoryDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      const newDisplay = cpCategoryMenu.style.display === 'block' ? 'none' : 'block';
      cpCategoryMenu.style.display = newDisplay;
      cpCategoryDropdown.setAttribute('aria-expanded', newDisplay === 'block');
    });

    const categoryOptions = cpCategoryMenu.querySelectorAll('.status-option');
    categoryOptions.forEach((option) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const category = option.dataset.category;
        selectedCategory = category;
        
        // Update active state
        categoryOptions.forEach((opt) => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Update label
        const displayText = option.textContent.trim();
        cpCategoryLabel.textContent = displayText;
        
        // Close menu
        cpCategoryMenu.style.display = 'none';
        cpCategoryDropdown.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!cpCategoryDropdown.contains(e.target) && !cpCategoryMenu.contains(e.target)) {
        cpCategoryMenu.style.display = 'none';
        cpCategoryDropdown.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ──── Highlight Select Dropdown (Old UI) ────
  const cpHighlightSelectDropdown = document.getElementById('cpHighlightSelectDropdown');
  const cpHighlightSelectLabel = document.getElementById('cpHighlightSelectLabel');
  const cpHighlightSelectMenu = document.getElementById('cpHighlightSelectMenu');
  const highlightsDurationLabel = document.getElementById('highlightsDurationLabel');
  const highlightsDurationMenu = document.getElementById('highlightsDurationMenu');

  function formatDateTimeDMY(dateInput) {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  function toLocalDatetimeInputValue(dateInput) {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function getScheduledInputValue(post) {
    if (!post) return '';

    if (post.scheduledDateISO) {
      return toLocalDatetimeInputValue(post.scheduledDateISO);
    }

    if (post.scheduledDate) {
      const dmyMatch = String(post.scheduledDate).match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
      if (dmyMatch) {
        const [, dd, mm, yyyy, hh, min] = dmyMatch;
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      }

      return toLocalDatetimeInputValue(post.scheduledDate);
    }

    return '';
  }

  if (cpHighlightSelectDropdown) {
    cpHighlightSelectDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      const newDisplay = cpHighlightSelectMenu.style.display === 'block' ? 'none' : 'block';
      cpHighlightSelectMenu.style.display = newDisplay;
      cpHighlightSelectDropdown.setAttribute('aria-expanded', newDisplay === 'block');
    });

    const highlightMenuOptions = cpHighlightSelectMenu.querySelectorAll('.cp-highlight-menu-option');
    highlightMenuOptions.forEach((option) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const days = parseInt(option.dataset.days, 10);
        selectedHighlightsDays = days;
        
        // Update active state
        highlightMenuOptions.forEach((opt) => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Update label
        const displayText = option.textContent.trim();
        cpHighlightSelectLabel.textContent = displayText;
        
        // Update the new dropdown too
        if (highlightsDurationLabel) {
          highlightsDurationLabel.textContent = displayText;
        }
        
        // Close menu
        cpHighlightSelectMenu.style.display = 'none';
        cpHighlightSelectDropdown.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!cpHighlightSelectDropdown.contains(e.target) && !cpHighlightSelectMenu.contains(e.target)) {
        cpHighlightSelectMenu.style.display = 'none';
        cpHighlightSelectDropdown.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ──── Highlight Date Modal Handlers ────
  const highlightDateModal = document.getElementById('highlightDateModal');
  const highlightDateBtn = document.querySelector('.cp-highlight-date-btn');
  const highlightDateModalClose = document.getElementById('highlightDateModalClose');
  const highlightDateCancelBtn = document.getElementById('highlightDateCancelBtn');
  const highlightDateConfirmBtn = document.getElementById('highlightDateConfirmBtn');
  const highlightDateModalTitle = document.getElementById('highlightDateModalTitle');
  const highlightDateInputLabel = document.getElementById('highlightDateInputLabel');
  const highlightDateInput = document.getElementById('highlightDateInput');
  const highlightDateLabel = document.getElementById('highlightDateLabel');
  const datePickerDropdown = document.getElementById('datePickerDropdown');
  const unpublishDateLabel = document.getElementById('unpublishDateLabel');
  const neverUnpublishCheckbox = document.getElementById('neverUnpublish');
  let selectedUnpublishDate = null;
  let activeDateTarget = 'highlight';

  function openDateModal(target) {
    activeDateTarget = target;

    if (target === 'unpublish') {
      if (highlightDateModalTitle) highlightDateModalTitle.textContent = 'Choose Unpublish Date';
      if (highlightDateInputLabel) highlightDateInputLabel.textContent = 'Date & Time:';
      if (highlightDateConfirmBtn) highlightDateConfirmBtn.textContent = 'Confirm';
    } else if (target === 'schedule') {
      if (highlightDateModalTitle) highlightDateModalTitle.textContent = 'Choose Schedule Date';
      if (highlightDateInputLabel) highlightDateInputLabel.textContent = 'Date & Time:';
      if (highlightDateConfirmBtn) highlightDateConfirmBtn.textContent = 'Schedule';
    } else {
      if (highlightDateModalTitle) highlightDateModalTitle.textContent = 'Choose Highlight End Date';
      if (highlightDateInputLabel) highlightDateInputLabel.textContent = 'Date & Time:';
      if (highlightDateConfirmBtn) highlightDateConfirmBtn.textContent = 'Confirm';
    }

    if (highlightDateInput) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 1);
      defaultDate.setHours(9, 0, 0, 0);
      highlightDateInput.value = highlightDateInput.value || toLocalDatetimeInputValue(defaultDate);
    }

    highlightDateModal.style.display = 'flex';
  }

  function closeHighlightDateModal() {
    highlightDateModal.style.display = 'none';
  }

  // Open modal when "Choose date" button is clicked
  if (highlightDateBtn) {
    highlightDateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openDateModal('highlight');
    });
  }

  if (datePickerDropdown) {
    datePickerDropdown.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (neverUnpublishCheckbox?.checked) return;
      openDateModal('unpublish');
    });
  }

  if (highlightDateModalClose) {
    highlightDateModalClose.addEventListener('click', closeHighlightDateModal);
  }

  if (highlightDateCancelBtn) {
    highlightDateCancelBtn.addEventListener('click', closeHighlightDateModal);
  }

  if (highlightDateModal) {
    highlightDateModal.addEventListener('click', (e) => {
      if (e.target === highlightDateModal) closeHighlightDateModal();
    });
  }

  if (highlightDateConfirmBtn) {
    highlightDateConfirmBtn.addEventListener('click', () => {
      const selectedDate = highlightDateInput.value;

      if (!selectedDate) {
        showToast('Please select a date and time');
        return;
      }

      const formattedDate = formatDateTimeDMY(selectedDate);

      if (activeDateTarget === 'unpublish') {
        selectedUnpublishDate = formattedDate;
        if (unpublishDateLabel) {
          unpublishDateLabel.textContent = formattedDate;
          unpublishDateLabel.classList.remove('cp-dropdown-placeholder');
        }
        showToast('Unpublish date set');
      } else if (activeDateTarget === 'schedule') {
        schedulePostAt(selectedDate);
        return;
      } else {
        selectedHighlightDate = formattedDate;
        if (highlightDateLabel) {
          highlightDateLabel.textContent = formattedDate;
        }
        showToast('Highlight end date set');
      }

      closeHighlightDateModal();
    });
  }

  // ──── Accordion Setup for Collapsed Sections ────
  const collapsedSectionItems = {
    'Schedules': ['Schedules', 'Pending access requests', 'API users', 'API documentation', 'Channels', 'Import status', 'Schedule changes'],
    'Mediabank': ['Workspaces', 'Inbox', 'Archive'],
    'Website': ['Homepage', 'Contact cards', 'Menus', 'Pages', 'Footer']
  };

  const collapsedHeaders = document.querySelectorAll('.acc-header.collapsed-only');
  const collapsedGroups = [];

  collapsedHeaders.forEach((header) => {
    const title = header.querySelector('.acc-title')?.textContent?.trim();
    if (!title || !collapsedSectionItems[title]) return;

    // Check if items already exist to prevent duplicates
    const parent = header.closest('.accordion-section');
    if (parent.querySelector('.acc-items')) return;

    // Create acc-items wrapper
    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'acc-items';
    itemsWrap.style.maxHeight = '0';
    itemsWrap.style.overflow = 'hidden';
    itemsWrap.style.transition = 'max-height 0.3s ease';

    // Add items
    const iconMap = {
      'Schedules': '<svg class="nav-icon" viewBox="0 0 640 640" fill="none"><path d="M208 64C216.8 64 224 71.2 224 80L224 128L416 128L416 80C416 71.2 423.2 64 432 64C440.8 64 448 71.2 448 80L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 80C192 71.2 199.2 64 208 64zM480 160L160 160C142.3 160 128 174.3 128 192L128 224L512 224L512 192C512 174.3 497.7 160 480 160zM512 256L128 256L128 480C128 497.7 142.3 512 160 512L480 512C497.7 512 512 497.7 512 480L512 256z" fill="currentColor"/></svg>',
      'Pending access requests': '<svg class="nav-icon" viewBox="0 0 640 640" fill="none"><path d="M320 272C364.2 272 400 236.2 400 192C400 147.8 364.2 112 320 112C275.8 112 240 147.8 240 192C240 236.2 275.8 272 320 272zM320 80C381.9 80 432 130.1 432 192C432 253.9 381.9 304 320 304C258.1 304 208 253.9 208 192C208 130.1 258.1 80 320 80zM296 384C229.7 384 176 437.7 176 504L176 528C176 536.8 168.8 544 160 544C151.2 544 144 536.8 144 528L144 504C144 420.1 212.1 352 296 352L344 352C427.9 352 496 420.1 496 504L496 528C496 536.8 488.8 544 480 544C471.2 544 464 536.8 464 528L464 504C464 437.7 410.3 384 344 384L296 384zM431.4 306.8C439.2 299.2 446.3 290.8 452.4 281.8C460.7 285.8 470.1 288 480 288C515.3 288 544 259.3 544 224C544 188.7 515.3 160 480 160C478.9 160 477.9 160 476.8 160.1C474.6 149.3 471.3 138.8 467 128.9C471.2 128.3 475.6 128 479.9 128C532.9 128 575.9 171 575.9 224C575.9 277 532.9 320 479.9 320C462.2 320 445.6 315.2 431.3 306.8zM160 128C164.4 128 168.7 128.3 172.9 128.9C168.6 138.8 165.3 149.3 163.1 160.1C162 160 161 160 159.9 160C124.6 160 95.9 188.7 95.9 224C95.9 259.3 124.6 288 159.9 288C169.8 288 179.1 285.8 187.4 281.8C193.5 290.9 200.6 299.2 208.4 306.8C194.2 315.2 177.6 320 159.8 320C106.8 320 63.8 277 63.8 224C63.8 171 106.8 128 159.8 128zM149.4 368C139.8 378.3 131.3 389.6 124.1 401.8C71.8 411.2 32 457 32 512L32 528C32 536.8 24.8 544 16 544C7.2 544 0 536.8 0 528L0 512C0 432.5 64.5 368 144 368L149.4 368zM516 401.8C508.8 389.7 500.3 378.3 490.7 368L496 368C575.5 368 640 432.5 640 512L640 528C640 536.8 632.8 544 624 544C615.2 544 608 536.8 608 528L608 512C608 457 568.3 411.2 515.9 401.8z" fill="currentColor"/></svg>',
      'API users': '<svg class="nav-icon" viewBox="0 0 640 640" fill="none"><path d="M320 272C364.2 272 400 236.2 400 192C400 147.8 364.2 112 320 112C275.8 112 240 147.8 240 192C240 236.2 275.8 272 320 272zM320 80C381.9 80 432 130.1 432 192C432 253.9 381.9 304 320 304C258.1 304 208 253.9 208 192C208 130.1 258.1 80 320 80zM296 384C229.7 384 176 437.7 176 504L176 528C176 536.8 168.8 544 160 544C151.2 544 144 536.8 144 528L144 504C144 420.1 212.1 352 296 352L344 352C427.9 352 496 420.1 496 504L496 528C496 536.8 488.8 544 480 544C471.2 544 464 536.8 464 528L464 504C464 437.7 410.3 384 344 384L296 384z" fill="currentColor"/></svg>',
      'API documentation': '<svg class="nav-icon" viewBox="0 0 640 640" fill="none"><path d="M320 96L192 96C174.3 96 160 110.3 160 128L160 512C160 529.7 174.3 544 192 544L448 544C465.7 544 480 529.7 480 512L480 256L384 256C348.7 256 320 227.3 320 192L320 96zM466.7 224L352 109.3L352 192C352 209.7 366.3 224 384 224L466.7 224zM128 128C128 92.7 156.7 64 192 64L325.5 64C342.5 64 358.8 70.7 370.8 82.7L493.3 205.3C505.3 217.3 512 233.6 512 250.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128z" fill="currentColor"/></svg>',
      'Channels': '<svg class="nav-icon" viewBox="0 0 640 640" fill="none"><path d="M64 480C64 471.2 71.2 464 80 464L145.6 464C153 427.5 185.3 400 224 400C262.7 400 295 427.5 302.4 464L560 464C568.8 464 576 471.2 576 480C576 488.8 568.8 496 560 496L302.4 496C295 532.5 262.7 560 224 560C185.3 560 153 532.5 145.6 496L80 496C71.2 496 64 488.8 64 480zM272 480C272 453.5 250.5 432 224 432C197.5 432 176 453.5 176 480C176 506.5 197.5 528 224 528C250.5 528 272 506.5 272 480zM464 320C464 293.5 442.5 272 416 272C389.5 272 368 293.5 368 320C368 346.5 389.5 368 416 368C442.5 368 464 346.5 464 320zM416 240C454.7 240 487 267.5 494.4 304L560 304C568.8 304 576 311.2 576 320C576 328.8 568.8 336 560 336L494.4 336C487 372.5 454.7 400 416 400C377.3 400 345 372.5 337.6 336L80 336C71.2 336 64 328.8 64 320C64 311.2 71.2 304 80 304L337.6 304C345 267.5 377.3 240 416 240zM256 112C229.5 112 208 133.5 208 160C208 186.5 229.5 208 256 208C282.5 208 304 186.5 304 160C304 133.5 282.5 112 256 112zM334.4 144L560 144C568.8 144 576 151.2 576 160C576 168.8 568.8 176 560 176L334.4 176C327 212.5 294.7 240 256 240C217.3 240 185 212.5 177.6 176L80 176C71.2 176 64 168.8 64 160C64 151.2 71.2 144 80 144L177.6 144C185 107.5 217.3 80 256 80C294.7 80 327 107.5 334.4 144z" fill="currentColor"/></svg>',
      'Import status': '<svg class="nav-icon" viewBox="0 0 640 640" fill="none"><path d="M336 118.6L336 400C336 408.8 328.8 416 320 416C311.2 416 304 408.8 304 400L304 118.6L219.3 203.3C213.1 209.5 202.9 209.5 196.7 203.3C190.5 197.1 190.5 186.9 196.7 180.7L308.7 68.7C314.9 62.5 325.1 62.5 331.3 68.7L443.3 180.7C449.5 186.9 449.5 197.1 443.3 203.3C437.1 209.5 426.9 209.5 420.7 203.3L336 118.6zM256 384L160 384C142.3 384 128 398.3 128 416L128 480C128 497.7 142.3 512 160 512L480 512C497.7 512 512 497.7 512 480L512 416C512 398.3 497.7 384 480 384L384 384L384 352L480 352C515.3 352 544 380.7 544 416L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 416C96 380.7 124.7 352 160 352L256 352L256 384zM416 448C416 434.7 426.7 424 440 424C453.3 424 464 434.7 464 448C464 461.3 453.3 472 440 472C426.7 472 416 461.3 416 448z" fill="currentColor"/></svg>',
      'Schedule changes': '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><path d="M3.01562 9.53438C3.125 7.9 3.80313 6.3 5.05 5.05C6.41563 3.68438 8.20625 3 10 3C11.9375 3 13.7875 3.79688 15.1187 5.20625L16.3406 6.5H13C12.725 6.5 12.5 6.725 12.5 7C12.5 7.275 12.725 7.5 13 7.5H17.5C17.775 7.5 18 7.275 18 7V2.5C18 2.225 17.775 2 17.5 2C17.225 2 17 2.225 17 2.5V5.74375L15.8438 4.52187C14.325 2.9125 12.2125 2 10 2C7.95312 2 5.90625 2.78125 4.34375 4.34375C2.91562 5.76875 2.14062 7.6 2.01875 9.46562C2 9.74375 2.20937 9.98125 2.48438 10C2.75938 10.0188 2.99687 9.80938 3.01562 9.53438ZM16.9844 10.4688C16.875 12.1031 16.1969 13.7031 14.95 14.95C13.5844 16.3156 11.7938 17 10 17C8.0625 17 6.2125 16.2031 4.88125 14.7937L3.65937 13.5H7C7.275 13.5 7.5 13.275 7.5 13C7.5 12.725 7.275 12.5 7 12.5H2.5C2.225 12.5 2 12.725 2 13V17.5C2 17.775 2.225 18 2.5 18C2.775 18 3 17.775 3 17.5V14.2563L4.15625 15.4781C5.675 17.0875 7.79063 17.9969 10 17.9969C12.0469 17.9969 14.0938 17.2156 15.6562 15.6531C17.0812 14.2281 17.8563 12.3937 17.9813 10.5281C18 10.2531 17.7906 10.0156 17.5156 9.99687C17.2406 9.97812 17.0031 10.1875 16.9844 10.4625V10.4688Z" fill="currentColor"/></svg>',
      'Workspaces': '<svg class="nav-icon" viewBox="0 0 640 640" fill="none"><path d="M128 480L512 480C529.7 480 544 465.7 544 448L544 208C544 190.3 529.7 176 512 176L362.7 176C348.9 176 335.4 171.5 324.3 163.2L285.9 134.4C280.4 130.2 273.6 128 266.7 128L128 128C110.3 128 96 142.3 96 160L96 448C96 465.7 110.3 480 128 480zM512 512L128 512C92.7 512 64 483.3 64 448L64 160C64 124.7 92.7 96 128 96L266.7 96C280.5 96 294 100.5 305.1 108.8L343.5 137.6C349 141.8 355.8 144 362.7 144L512 144C547.3 144 576 172.7 576 208L576 448C576 483.3 547.3 512 512 512z" fill="currentColor"/></svg>',
      'Inbox': '<svg class="nav-icon" viewBox="0 0 640 640" fill="none"><path d="M129.8 155.3C132.1 139.6 145.6 128 161.5 128L478.6 128C494.5 128 507.9 139.6 510.3 155.3L541.6 368L440.7 368C430 368 420 373.3 414.1 382.2L391.6 416L248.7 416L226.2 382.2C220.3 373.3 210.3 368 199.6 368L98.5 368L129.8 155.3zM96 400L199.4 400L221.9 433.8C227.8 442.7 237.8 448 248.5 448L391.4 448C402.1 448 412.1 442.7 418 433.8L440.5 400L543.9 400L543.9 480C543.9 497.7 529.6 512 511.9 512L128 512C110.3 512 96 497.7 96 480L96 400zM161.5 96C129.7 96 102.8 119.3 98.1 150.7L64.7 378.2C64.2 381.3 64 384.4 64 387.5L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 387.5C576 384.4 575.8 381.3 575.3 378.2L541.9 150.7C537.2 119.3 510.3 96 478.5 96L161.5 96z" fill="currentColor"/></svg>',
      'Archive': '<svg class="nav-icon" viewBox="0 0 640 640" fill="none"><path d="M528 128C536.8 128 544 135.2 544 144L544 176C544 184.8 536.8 192 528 192L112 192C103.2 192 96 184.8 96 176L96 144C96 135.2 103.2 128 112 128L528 128zM64 176C64 196.9 77.4 214.7 96 221.3L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 221.3C562.6 214.7 576 196.9 576 176L576 144C576 117.5 554.5 96 528 96L112 96C85.5 96 64 117.5 64 144L64 176zM128 480L128 224L512 224L512 480C512 497.7 497.7 512 480 512L160 512C142.3 512 128 497.7 128 480zM240 288C231.2 288 224 295.2 224 304C224 312.8 231.2 320 240 320L400 320C408.8 320 416 312.8 416 304C416 295.2 408.8 288 400 288L240 288z" fill="currentColor"/></svg>',
      'Homepage': '<svg class="nav-icon" viewBox="0 0 640 640" fill="none"><path d="M309.6 68.3C315.7 62.6 325.3 62.6 331.4 68.3L571.4 292.3C577.9 298.3 578.2 308.5 572.2 314.9C566.2 321.3 556 321.7 549.6 315.7L528.5 296L528.5 512C528.5 547.3 499.8 576 464.5 576L176.5 576C141.2 576 112.5 547.3 112.5 512L112.5 296L91.4 315.7C84.9 321.7 74.8 321.4 68.8 314.9C62.8 308.4 63.1 298.3 69.6 292.3L309.6 68.3zM320.5 101.9L144.5 266.2L144.5 512C144.5 529.7 158.8 544 176.5 544L240.5 544L240.5 432C240.5 396.7 269.2 368 304.5 368L336.5 368C371.8 368 400.5 396.7 400.5 432L400.5 544L464.5 544C482.2 544 496.5 529.7 496.5 512L496.5 266.2L320.5 101.9zM272.5 544L368.5 544L368.5 432C368.5 414.3 354.2 400 336.5 400L304.5 400C286.8 400 272.5 414.3 272.5 432L272.5 544z" fill="currentColor"/></svg>',
      'Contact cards': '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><path d="M7 6C7 4.34375 8.34375 3 10 3C11.6562 3 13 4.34375 13 6C13 7.65625 11.6562 9 10 9C8.34375 9 7 7.65625 7 6ZM14 6C14 3.79063 12.2094 2 10 2C7.79063 2 6 3.79063 6 6C6 8.20937 7.79063 10 10 10C12.2094 10 14 8.20937 14 6ZM4 17C4 14.5156 6.01562 12.5 8.5 12.5H11.5C13.9844 12.5 16 14.5156 16 17V17.5C16 17.775 16.225 18 16.5 18C16.775 18 17 17.775 17 17.5V17C17 13.9625 14.5375 11.5 11.5 11.5H8.5C5.4625 11.5 3 13.9625 3 17V17.5C3 17.775 3.225 18 3.5 18C3.775 18 4 17.775 4 17.5V17Z" fill="currentColor"/></svg>',
      'Menus': '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><path d="M3 4.5C3 4.225 3.225 4 3.5 4H16.5C16.775 4 17 4.225 17 4.5C17 4.775 16.775 5 16.5 5H3.5C3.225 5 3 4.775 3 4.5ZM3 10C3 9.725 3.225 9.5 3.5 9.5H16.5C16.775 9.5 17 9.725 17 10C17 10.275 16.775 10.5 16.5 10.5H3.5C3.225 10.5 3 10.275 3 10ZM17 15.5C17 15.775 16.775 16 16.5 16H3.5C3.225 16 3 15.775 3 15.5C3 15.225 3.225 15 3.5 15H16.5C16.775 15 17 15.225 17 15.5Z" fill="currentColor"/></svg>',
      'Pages': '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><path d="M10 3H6C5.44687 3 5 3.44687 5 4V16C5 16.5531 5.44687 17 6 17H14C14.5531 17 15 16.5531 15 16V8H12C10.8969 8 10 7.10312 10 6V3ZM14.5844 7L11 3.41563V6C11 6.55313 11.4469 7 12 7H14.5844ZM4 4C4 2.89688 4.89688 2 6 2H10.1719C10.7031 2 11.2125 2.20937 11.5875 2.58437L15.4156 6.41563C15.7906 6.79063 16 7.3 16 7.83125V16C16 17.1031 15.1031 18 14 18H6C4.89688 18 4 17.1031 4 16V4Z" fill="currentColor"/></svg>',
      'Footer': '<svg class="nav-icon" viewBox="0 0 640 640" fill="none"><path d="M68.7 155.3C62.5 149.1 62.5 138.9 68.7 132.7C74.9 126.5 85.1 126.5 91.3 132.7L267.3 308.7C273.5 314.9 273.5 325.1 267.3 331.3L91.3 507.3C85.1 513.5 74.9 513.5 68.7 507.3C62.5 501.1 62.5 490.9 68.7 484.7L233.4 320L68.7 155.3zM560 480C568.8 480 576 487.2 576 496C576 504.8 568.8 512 560 512L272 512C263.2 512 256 504.8 256 496C256 487.2 263.2 480 272 480L560 480z" fill="currentColor"/></svg>'
    };

    collapsedSectionItems[title].forEach((label) => {
      const item = document.createElement('div');
      item.className = 'nav-item sr-item';
      item.dataset.section = title.toLowerCase().replace(/\s+/g, '-');
      item.dataset.label = label;
      const icon = iconMap[label] || '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><path d="M10 3C6.13 3 3 6.13 3 10s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" fill="currentColor"/></svg>';
      item.innerHTML = `
        ${icon}
        <span>${label}</span>
        <svg class="item-chevron" width="6" height="10" viewBox="0 0 6.8801 11.3654" fill="none"><path d="M0.280074 11.1326C-0.0930948 10.787 -0.0933998 10.1969 0.279411 9.85086L4.77015 5.68269L0.279431 1.5145C-0.093366 1.16847 -0.0930665 0.578438 0.280083 0.232795C0.615172 -0.0775938 1.13276 -0.0775987 1.46785 0.232783L6.55964 4.94905C6.98693 5.34482 6.98692 6.02056 6.55964 6.41633L1.46785 11.1326C1.13276 11.443 0.615169 11.443 0.280074 11.1326Z" fill="currentColor"/></svg>
      `;
      itemsWrap.appendChild(item);

      item.addEventListener('click', () => {
        const section = item.dataset.section;
        const itemLabel = item.dataset.label;
        sessionStorage.setItem('sr_target_section', section);
        sessionStorage.setItem('sr_target_item', itemLabel);
        window.location.href = 'medicenter.html';
      });
    });

    header.parentNode.insertBefore(itemsWrap, header.nextSibling);
    collapsedGroups.push({ header, itemsWrap });
  });

  // Global accordion state - track which item is open
  let openAccordionItem = null;

  // Accordion toggle for collapsed sections
  collapsedGroups.forEach(({ header, itemsWrap }) => {
    header.style.cursor = 'pointer';
    itemsWrap.dataset.open = 'false';
    const section = header.closest('.accordion-section') || header.parentElement;
    
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = itemsWrap.dataset.open === 'true';

      // Close all main accordions
      document.querySelectorAll('.accordion-section[id^="acc-"]').forEach((sec) => {
        if (!sec.getElementById) sec.classList.remove('is-open');
      });
      
      // Close all other collapsed sections
      collapsedGroups.forEach((group) => {
        group.itemsWrap.style.maxHeight = '0';
        group.itemsWrap.dataset.open = 'false';
        const grpSection = group.header.closest('.accordion-section') || group.header.parentElement;
        if (grpSection) grpSection.classList.remove('is-open');
      });

      // Toggle the clicked section
      if (!isOpen) {
        itemsWrap.style.maxHeight = '700px';
        itemsWrap.dataset.open = 'true';
        if (section) section.classList.add('is-open');
        openAccordionItem = 'collapsed-' + header.querySelector('.acc-title')?.textContent?.trim();
      } else {
        openAccordionItem = null;
      }
    });
  });

  // Accordion toggle for main accordions (Media Center, Screening Room)
  document.querySelectorAll('.acc-header[data-target]').forEach((header) => {
    if (header.classList.contains('collapsed-only')) return; // Skip collapsed sections
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = header.dataset.target;
      const section = document.getElementById('acc-' + target);
      if (!section) return;

      if (openAccordionItem === target && section.classList.contains('is-open')) {
        // Collapse it
        section.classList.remove('is-open');
        openAccordionItem = null;
      } else {
        // Close all collapsed sections
        collapsedGroups.forEach((group) => {
          group.itemsWrap.style.maxHeight = '0';
          group.itemsWrap.dataset.open = 'false';
          const grpSection = group.header.closest('.accordion-section') || group.header.parentElement;
          if (grpSection) grpSection.classList.remove('is-open');
        });
        
        // Close other main accordions
        document.querySelectorAll('.accordion-section[id^="acc-"]').forEach((sec) => {
          if (sec.id !== 'acc-' + target) sec.classList.remove('is-open');
        });
        
        section.classList.add('is-open');
        openAccordionItem = target;
      }
    });
  });

const RICH_TOOLBAR_HTML = `
<div class="rich-toolbar">
  <button type="button" class="rich-pill">
    <span class="rich-pill-text serif">Times new...</span>
    <svg width="6" height="5" viewBox="0 0 6 5" fill="none"><path d="M0 0.5L3 4L6 0.5" stroke="#4E4D4D" stroke-width="1"/></svg>
  </button>
  <button type="button" class="rich-pill">
    <span class="rich-pill-text">12</span>
    <svg width="6" height="5" viewBox="0 0 6 5" fill="none"><path d="M0 0.5L3 4L6 0.5" stroke="#4E4D4D" stroke-width="1"/></svg>
  </button>
  <button type="button" class="rich-pill">
    <span class="rich-pill-text">Paragraph</span>
    <svg width="6" height="5" viewBox="0 0 6 5" fill="none"><path d="M0 0.5L3 4L6 0.5" stroke="#4E4D4D" stroke-width="1"/></svg>
  </button>
  <div class="rich-divider"></div>
  <button type="button" class="rich-color-btn" title="Text color">
    <span class="rich-a">A</span>
    <div class="rich-a-bar" style="background:#000"></div>
  </button>
  <button type="button" class="rich-color-btn" title="Highlight">
    <svg width="16" height="16" viewBox="0 0 640 640" fill="none">
      <path opacity="0.4" d="M95 474.4C96.5 478.9 99.1 483.1 102.6 486.6L153.3 537.3C156.9 540.9 161.1 543.4 165.5 544.9C176.7 548.7 189.6 546.2 198.5 537.3L255.9 479.9L327.6 479.9C342.9 479.9 357.2 472.7 366.2 460.4L392.5 424.6L215 247.1C203.1 255.9 191.2 264.7 179.3 273.4C167 282.4 159.8 296.8 159.8 312L159.8 383.7C140.7 402.8 121.6 422 102.4 441.1C93.5 450 90.9 462.9 94.8 474.1z" fill="#333"/>
      <path d="M392.7 424.7L215.3 247.3L452.6 72.4C460 66.9 469 64 478.2 64C489.6 64 500.5 68.5 508.6 76.6L563.4 131.4C571.5 139.5 576 150.4 576 161.9C576 171.1 573.1 180.1 567.6 187.5L392.7 424.7zM39 530.3L95 474.3C96.5 478.8 99.1 483 102.6 486.5L153.3 537.2C156.9 540.8 161.1 543.3 165.5 544.8L141.5 568.8C137 573.3 130.9 575.8 124.5 575.8L56 576C42.7 576 32 565.3 32 552L32 547.3C32 540.9 34.5 534.8 39 530.3z" fill="#333"/>
    </svg>
    <div class="rich-a-bar" style="background:#f8cc35"></div>
  </button>
  <div class="rich-divider"></div>
  <button type="button" class="rich-btn bold" title="Bold"><span style="font-size: 16px; font-weight: 700;">B</span></button>
  <button type="button" class="rich-btn italic" title="Italic"><span style="font-size: 16px; font-style: italic; font-family: 'Times New Roman', serif;">I</span></button>
  <button type="button" class="rich-btn underline" title="Underline"><span style="font-size: 16px; text-decoration: underline;">U</span></button>
  <div class="rich-divider"></div>
  <button type="button" class="rich-btn rich-align-left" title="Align left">
    <svg width="16" height="16" viewBox="0 0 640 640" fill="none">
      <path d="M112 112C103.2 112 96 119.2 96 128C96 136.8 103.2 144 112 144L368 144C376.8 144 384 136.8 384 128C384 119.2 376.8 112 368 112L112 112zM112 240C103.2 240 96 247.2 96 256C96 264.8 103.2 272 112 272L528 272C536.8 272 544 264.8 544 256C544 247.2 536.8 240 528 240L112 240zM96 384C96 392.8 103.2 400 112 400L368 400C376.8 400 384 392.8 384 384C384 375.2 376.8 368 368 368L112 368C103.2 368 96 375.2 96 384zM112 496C103.2 496 96 503.2 96 512C96 520.8 103.2 528 112 528L528 528C536.8 528 544 520.8 544 512C544 503.2 536.8 496 528 496L112 496z" fill="#333"/>
    </svg>
  </button>
  <button type="button" class="rich-btn rich-align-center" title="Align center">
    <svg width="16" height="16" viewBox="0 0 640 640" fill="none">
      <path d="M208 112C199.2 112 192 119.2 192 128C192 136.8 199.2 144 208 144L432 144C440.8 144 448 136.8 448 128C448 119.2 440.8 112 432 112L208 112zM112 240C103.2 240 96 247.2 96 256C96 264.8 103.2 272 112 272L528 272C536.8 272 544 264.8 544 256C544 247.2 536.8 240 528 240L112 240zM192 384C192 392.8 199.2 400 208 400L432 400C440.8 400 448 392.8 448 384C448 375.2 440.8 368 432 368L208 368C199.2 368 192 375.2 192 384zM112 496C103.2 496 96 503.2 96 512C96 520.8 103.2 528 112 528L528 528C536.8 528 544 520.8 544 512C544 503.2 536.8 496 528 496L112 496z" fill="#333"/>
    </svg>
  </button>
  <button type="button" class="rich-btn rich-align-right" title="Align right">
    <svg width="16" height="16" viewBox="0 0 640 640" fill="none">
      <path d="M528 112C536.8 112 544 119.2 544 128C544 136.8 536.8 144 528 144L272 144C263.2 144 256 136.8 256 128C256 119.2 263.2 112 272 112L528 112zM528 240C536.8 240 544 247.2 544 256C544 264.8 536.8 272 528 272L112 272C103.2 272 96 264.8 96 256C96 247.2 103.2 240 112 240L528 240zM544 384C544 392.8 536.8 400 528 400L272 400C263.2 400 256 392.8 256 384C256 375.2 263.2 368 272 368L528 368C536.8 368 544 375.2 544 384zM528 496C536.8 496 544 503.2 544 512C544 520.8 536.8 528 528 528L112 528C103.2 528 96 520.8 96 512C96 503.2 103.2 496 112 496L528 496z" fill="#333"/>
    </svg>
  </button>
  <button type="button" class="rich-btn" title="Body format">
    <svg width="16" height="16" viewBox="0 0 640 640" fill="none">
      <path d="M64 128C64 92.7 92.7 64 128 64L416 64C451.3 64 480 92.7 480 128L496 128C540.2 128 576 163.8 576 208L576 304C576 348.2 540.2 384 496 384L336 384C327.2 384 320 391.2 320 400L320 418.7C338.6 425.3 352 443.1 352 464L352 560C352 586.5 330.5 608 304 608L272 608C245.5 608 224 586.5 224 560L224 464C224 443.1 237.4 425.3 256 418.7L256 400C256 355.8 291.8 320 336 320L496 320C504.8 320 512 312.8 512 304L512 208C512 199.2 504.8 192 496 192L480 192C480 227.3 451.3 256 416 256L128 256C92.7 256 64 227.3 64 192L64 128z" fill="#333"/>
    </svg>
  </button>
  <button type="button" class="rich-btn rich-more" title="More">
    <span class="rich-dot"></span>
    <span class="rich-dot"></span>
    <span class="rich-dot"></span>
  </button>
</div>`;

  // Inject rich toolbars
  document.querySelectorAll('.rich-editor').forEach((editor) => {
    editor.insertAdjacentHTML('afterbegin', RICH_TOOLBAR_HTML);
  });

  // Alignment buttons functionality
  const alignButtons = document.querySelectorAll('.rich-align-left, .rich-align-center, .rich-align-right');
  alignButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // TODO: Apply alignment to selected text
    });
  });

  // Step tab switching
  const tabs = document.querySelectorAll('.cp-step-tab');
  const panels = document.querySelectorAll('.cp-step-panel');

  function updatePreview() {
    const title = (document.getElementById('cpTitle')?.value || '').trim();
    const preamble = (document.getElementById('cpPreamble')?.value || '').trim();
    const body = (document.getElementById('cpBody')?.value || '').trim();
    const boilerplate = (document.getElementById('cpBoilerplate')?.value || '').trim();
    document.getElementById('previewTitle').textContent = title || '(No title)';
    document.getElementById('previewBody').textContent = [preamble, body, boilerplate].filter(Boolean).join('\n\n') || '(No content)';
  }

  function switchStep(step) {
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.step === step));
    panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === step));
    if (step === '3') { updatePreview(); renderMediaThumbs(); }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchStep(tab.dataset.step));
  });

  // "Save and Continue" buttons
  document.querySelectorAll('.btn-cp[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => switchStep(btn.dataset.next));
  });

  // Tag management
  const tagInput = document.getElementById('tagInput');
  const addTagBtn = document.getElementById('addTagBtn');
  const tagPillsEl = document.getElementById('tagPills');
  const cpTags = new Set();

  function renderTags() {
    if (!tagPillsEl) return;
    tagPillsEl.innerHTML = '';
    cpTags.forEach((tag) => {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.innerHTML = `${tag} <button type="button" aria-label="Remove ${tag}">\u00d7</button>`;
      pill.querySelector('button').addEventListener('click', () => {
        cpTags.delete(tag);
        renderTags();
      });
      tagPillsEl.appendChild(pill);
    });
  }

  function addTag() {
    if (!tagInput) return;
    const val = tagInput.value.trim();
    if (!val) return;
    cpTags.add(val);
    tagInput.value = '';
    renderTags();
  }

  if (addTagBtn) addTagBtn.addEventListener('click', addTag);
  if (tagInput) {
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    });
  }

  // Close tag banner
  const bannerBtn = document.getElementById('closeBannerBtn');
  const tagBanner = document.getElementById('tagBanner');
  if (bannerBtn && tagBanner) {
    bannerBtn.addEventListener('click', () => {
      tagBanner.style.display = 'none';
    });
  }

  // Groups picker toggles
  function bindGroupsPanelToggle(checkboxId, panelId) {
    const checkbox = document.getElementById(checkboxId);
    const panel = document.getElementById(panelId);
    if (!checkbox || !panel) return;

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        panel.style.display = 'flex';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => panel.classList.add('is-faded'));
        });
        panel.classList.add('is-visible');
      } else {
        panel.classList.remove('is-faded');
        panel.addEventListener('transitionend', () => {
          if (!checkbox.checked) {
            panel.style.display = 'none';
            panel.classList.remove('is-visible');
          }
        }, { once: true });
      }
    });
  }

  bindGroupsPanelToggle('chkGroups', 'cpGroupsPanel');
  bindGroupsPanelToggle('chkNotifGroups', 'cpNotifGroupsPanel');

  const chkNotifAllContacts = document.getElementById('chkNotifAllContacts');
  const chkNotifGroups = document.getElementById('chkNotifGroups');
  const cpNotifMeta = document.getElementById('cpNotifMeta');

  function updateNotifMetaVisibility() {
    if (!cpNotifMeta) return;
    const shouldShow = Boolean(chkNotifAllContacts?.checked || chkNotifGroups?.checked);
    cpNotifMeta.style.display = shouldShow ? 'block' : 'none';
  }

  if (chkNotifAllContacts) {
    chkNotifAllContacts.addEventListener('change', () => {
      if (chkNotifAllContacts.checked && chkNotifGroups) {
        chkNotifGroups.checked = false;
      }
      updateNotifMetaVisibility();
    });
  }

  if (chkNotifGroups) {
    chkNotifGroups.addEventListener('change', () => {
      if (chkNotifGroups.checked && chkNotifAllContacts) {
        chkNotifAllContacts.checked = false;
      }
      updateNotifMetaVisibility();
    });
  }

  updateNotifMetaVisibility();

  const addContactBtn = document.querySelector('.cp-add-contact-btn');
  const contactAddPanel = document.getElementById('cpContactAddPanel');
  const contactEmailInput = document.getElementById('cpContactEmailInput');
  const contactEmailError = document.getElementById('cpContactEmailError');
  const confirmAddContactBtn = document.getElementById('cpConfirmAddContactBtn');
  const contactPillsEl = document.getElementById('cpContactPills');
  const notifContactsPanel = document.getElementById('cpNotifContactsPanel');
  const notifContactsList = document.getElementById('cpNotifContactsList');
  const addedContacts = new Set();

  function renderNotificationContacts() {
    if (!notifContactsPanel || !notifContactsList) return;

    notifContactsList.innerHTML = '';
    const contacts = Array.from(addedContacts);
    notifContactsPanel.classList.toggle('is-visible', contacts.length > 0);

    contacts.forEach((email) => {
      const label = document.createElement('label');
      label.className = 'cp-check-label';
      label.innerHTML = `<input type="checkbox" class="cp-chk" data-notif-contact="${email}" /> ${email}`;
      notifContactsList.appendChild(label);
    });
  }

  function setContactEmailError(message) {
    if (!contactEmailInput || !contactEmailError) return;

    contactEmailError.textContent = message;
    contactEmailError.classList.toggle('is-visible', Boolean(message));
    contactEmailInput.classList.toggle('is-error', Boolean(message));
  }

  function renderAddedContacts() {
    if (!contactPillsEl) return;
    contactPillsEl.innerHTML = '';

    addedContacts.forEach((email) => {
      const pill = document.createElement('span');
      pill.className = 'cp-contact-pill';
      pill.innerHTML = `${email} <button type="button" aria-label="Remove ${email}">\u00d7</button>`;
      pill.querySelector('button').addEventListener('click', () => {
        addedContacts.delete(email);
        renderAddedContacts();
        renderNotificationContacts();
      });
      contactPillsEl.appendChild(pill);
    });
  }

  function addContactEmail() {
    if (!contactEmailInput) return;

    const email = contactEmailInput.value.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email) {
      setContactEmailError('Enter an email address');
      return;
    }

    if (!isValidEmail) {
      setContactEmailError('Enter a valid email address');
      return;
    }

    setContactEmailError('');
    addedContacts.add(email);
    contactEmailInput.value = '';
    renderAddedContacts();
    renderNotificationContacts();
  }

  if (addContactBtn && contactAddPanel) {
    addContactBtn.addEventListener('click', () => {
      contactAddPanel.classList.toggle('is-visible');
      if (contactAddPanel.classList.contains('is-visible')) {
        contactEmailInput?.focus();
      }
    });
  }

  if (confirmAddContactBtn) {
    confirmAddContactBtn.addEventListener('click', addContactEmail);
  }

  if (contactEmailInput) {
    contactEmailInput.addEventListener('input', () => setContactEmailError(''));
    contactEmailInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addContactEmail();
      }
    });
  }

  // Media upload
  const addMediaBtn = document.getElementById('addMediaBtn');
  const mediaFileInput = document.getElementById('mediaFileInput');
  const mediaThumbsStep1 = document.getElementById('mediaThumbsStep1');
  const mediaThumbsStep3 = document.getElementById('mediaThumbsStep3');
  const uploadedMediaURLs = [];

  function getEditSourcePost() {
    if (editId) {
      const stored = JSON.parse(localStorage.getItem('mc_posts') || '[]');
      return stored.find((post) => String(post.id) === String(editId)) || null;
    }

    if (isTempEdit) {
      return JSON.parse(sessionStorage.getItem('mc_edit_post_temp') || 'null');
    }

    return null;
  }

  function setButtonLabelForEditMode() {
    // Don't change button labels - keep "Publish" as "Publish" and "Save and Continue" as is
  }

  let currentEditPost = null;

  function hydrateFormForEdit(post) {
    if (!post) return;

    currentEditPost = post;
    
    // Update the selected category for the dropdown
    if (post.category) {
      selectedCategory = post.category;
      if (cpCategoryLabel) {
        cpCategoryLabel.textContent = post.category;
      }
      // Mark the correct option as active in the menu
      const categoryOptions = cpCategoryMenu.querySelectorAll('.status-option');
      categoryOptions.forEach((opt) => {
        if (opt.dataset.category === post.category) {
          opt.classList.add('active');
        } else {
          opt.classList.remove('active');
        }
      });
      
      // Show/hide highlights duration field
      const highlightsDurationField = document.getElementById('highlightsDurationField');
      if (highlightsDurationField) {
        highlightsDurationField.style.display = post.category === 'highlights' ? 'block' : 'none';
      }
    }
    
    // Update highlights duration if editing a highlight post
    if (post.category === 'highlights' && post.highlightsDays && highlightsDurationMenu) {
      selectedHighlightsDays = post.highlightsDays;
      const durationOptions = highlightsDurationMenu.querySelectorAll('.status-option');
      durationOptions.forEach((opt) => {
        const days = parseInt(opt.dataset.days, 10);
        if (days === post.highlightsDays) {
          opt.classList.add('active');
          if (highlightsDurationLabel) {
            highlightsDurationLabel.textContent = opt.textContent.trim();
          }
        } else {
          opt.classList.remove('active');
        }
      });
    }

    const titleInput = document.getElementById('cpTitle');
    if (titleInput) titleInput.value = post.title || '';

    const highlightCheckbox = document.querySelector('[data-panel="1"] .cp-chk');
    if (highlightCheckbox) highlightCheckbox.checked = Boolean(post.highlight);

    if (post.thumb) {
      uploadedMediaURLs.push(post.thumb);
      renderMediaThumbs();
    }

    setButtonLabelForEditMode();
  }

  function renderMediaThumbs() {
    [mediaThumbsStep1, mediaThumbsStep3].forEach((container) => {
      if (!container) return;
      container.innerHTML = '';
      uploadedMediaURLs.forEach((url, index) => {
        const div = document.createElement('div');
        div.className = 'cp-media-thumb';
        const img = document.createElement('img');
        img.src = url;
        img.alt = '';
        div.appendChild(img);
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'cp-media-delete';
        deleteBtn.type = 'button';
        deleteBtn.setAttribute('aria-label', 'Delete media');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          uploadedMediaURLs.splice(index, 1);
          renderMediaThumbs();
        });
        div.appendChild(deleteBtn);
        
        container.appendChild(div);
      });
    });
  }

  if (addMediaBtn && mediaFileInput) {
    addMediaBtn.addEventListener('click', () => mediaFileInput.click());
    mediaFileInput.addEventListener('change', () => {
      Array.from(mediaFileInput.files).forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedMediaURLs.push(e.target.result);
          renderMediaThumbs();
        };
        reader.readAsDataURL(file);
      });
      mediaFileInput.value = '';
    });
  }

  hydrateFormForEdit(getEditSourcePost());

  // "Never unpublish" dims the date picker
  const neverChk = document.getElementById('neverUnpublish');
  const datePicker = document.getElementById('datePickerDropdown');
  if (neverChk && datePicker) {
    neverChk.addEventListener('change', () => {
      datePicker.classList.toggle('dimmed', neverChk.checked);
    });
  }

  // Toast helper
  const toastEl = document.getElementById('cpToast');
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove('show'), 1700);
  }

  // Generic button feedback
  document.querySelectorAll('.btn-cp-cyan, .btn-cp-muted, .btn-cp-outlined').forEach((btn) => {
    if (btn.dataset.next) return; // handled above
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim();
      if (label === 'Save') {
        const title = (document.getElementById('cpTitle')?.value || '').trim();
        const preamble = (document.getElementById('cpPreamble')?.value || '').trim();
        const body = (document.getElementById('cpBody')?.value || '').trim();
        const boilerplate = (document.getElementById('cpBoilerplate')?.value || '').trim();
        const category = selectedCategory;
        const highlight = document.querySelector('[data-panel="1"] .cp-chk')?.checked || false;
        const firstThumb = uploadedMediaURLs[0] || null;
        // If editing a scheduled post, keep it scheduled; otherwise save as draft
        const status = (currentEditPost?.status === 'scheduled') ? 'scheduled' : 'draft';
        const scheduledDate = currentEditPost?.scheduledDate;
        const stored = JSON.parse(localStorage.getItem('mc_posts') || '[]');

        if (editId) {
          const idx = stored.findIndex((item) => String(item.id) === String(editId));
          if (idx >= 0) {
            const updateObj = {
              ...stored[idx],
              title: title || '(Untitled)',
              category,
              highlight,
              thumb: firstThumb,
              status,
            };
            if (status === 'scheduled' && scheduledDate) {
              updateObj.scheduledDate = scheduledDate;
            }
            stored[idx] = updateObj;
            localStorage.setItem('mc_posts', JSON.stringify(stored));
            window.location.href = 'medicenter.html';
            return;
          }
        }

        const post = {
          id: Date.now(),
          title: title || '(Untitled)',
          category,
          highlight,
          thumb: firstThumb,
          publishedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status
        };
        stored.unshift(post);
        localStorage.setItem('mc_posts', JSON.stringify(stored));
        sessionStorage.removeItem('mc_edit_post_temp');
        window.location.href = 'medicenter.html';
      }
      else if (label === 'Preview') {
        // Preview action - no popup needed
      }
      else if (label === 'Publish') {
        const title = (document.getElementById('cpTitle')?.value || '').trim();
        const preamble = (document.getElementById('cpPreamble')?.value || '').trim();
        const body = (document.getElementById('cpBody')?.value || '').trim();
        const boilerplate = (document.getElementById('cpBoilerplate')?.value || '').trim();
        const category = selectedCategory;
        const highlight = document.querySelector('[data-panel="1"] .cp-chk')?.checked || false;
        const firstThumb = uploadedMediaURLs[0] || null;
        const status = 'published';
        const stored = JSON.parse(localStorage.getItem('mc_posts') || '[]');

        if (editId) {
          const idx = stored.findIndex((item) => String(item.id) === String(editId));
          if (idx >= 0) {
            const updateObj = {
              ...stored[idx],
              title: title || '(Untitled)',
              category,
              highlight,
              thumb: firstThumb,
              status,
            };
            // Include highlights duration if this is a highlight post
            if (category === 'highlights') {
              updateObj.highlightsDays = selectedHighlightsDays;
              if (selectedHighlightDate) {
                updateObj.highlightEndDate = selectedHighlightDate;
              }
            }
            stored[idx] = updateObj;
            localStorage.setItem('mc_posts', JSON.stringify(stored));
            window.location.href = 'medicenter.html';
            return;
          }
        }

        const post = {
          id: Date.now(),
          title: title || '(Untitled)',
          category,
          highlight,
          thumb: firstThumb,
          publishedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status
        };
        // Include highlights duration if this is a highlight post
        if (category === 'highlights') {
          post.highlightsDays = selectedHighlightsDays;
          if (selectedHighlightDate) {
            post.highlightEndDate = selectedHighlightDate;
          }
        }
        stored.unshift(post);
        localStorage.setItem('mc_posts', JSON.stringify(stored));
        sessionStorage.removeItem('mc_edit_post_temp');
        window.location.href = 'medicenter.html';
      }
      else if (label === 'Schedule') {
        document.getElementById('scheduleModal').style.display = 'flex';
        const scheduleDateInput = document.getElementById('scheduleDateInput');

        if (currentEditPost && currentEditPost.status === 'scheduled' && currentEditPost.scheduledDate) {
          scheduleDateInput.value = getScheduledInputValue(currentEditPost);
        } else {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(9, 0, 0, 0);
          scheduleDateInput.value = toLocalDatetimeInputValue(tomorrow);
        }
      }
    });
  });

  function schedulePostAt(selectedDate) {
    const title = (document.getElementById('cpTitle')?.value || '').trim();
    const category = selectedCategory;
    const highlight = document.querySelector('[data-panel="1"] .cp-chk')?.checked || false;
    const firstThumb = uploadedMediaURLs[0] || null;
    const status = 'scheduled';
    const scheduledDate = formatDateTimeDMY(selectedDate);
    const stored = JSON.parse(localStorage.getItem('mc_posts') || '[]');

    if (editId) {
      const idx = stored.findIndex((item) => String(item.id) === String(editId));
      if (idx >= 0) {
        stored[idx] = {
          ...stored[idx],
          title: title || '(Untitled)',
          category,
          highlight,
          thumb: firstThumb,
          status,
          scheduledDate,
          scheduledDateISO: selectedDate,
        };
        localStorage.setItem('mc_posts', JSON.stringify(stored));
        window.location.href = 'medicenter.html';
        return;
      }
    }

    const post = {
      id: Date.now(),
      title: title || '(Untitled)',
      category,
      highlight,
      thumb: firstThumb,
      publishedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status,
      scheduledDate,
      scheduledDateISO: selectedDate,
    };
    stored.unshift(post);
    localStorage.setItem('mc_posts', JSON.stringify(stored));
    sessionStorage.removeItem('mc_edit_post_temp');
    window.location.href = 'medicenter.html';
  }

  // Schedule modal handlers
  const scheduleModal = document.getElementById('scheduleModal');
  const scheduleModalClose = document.getElementById('scheduleModalClose');
  const scheduleCancelBtn = document.getElementById('scheduleCancelBtn');
  const scheduleConfirmBtn = document.getElementById('scheduleConfirmBtn');

  function closeScheduleModal() {
    scheduleModal.style.display = 'none';
  }

  scheduleModalClose.addEventListener('click', closeScheduleModal);
  scheduleCancelBtn.addEventListener('click', closeScheduleModal);

  scheduleModal.addEventListener('click', (e) => {
    if (e.target === scheduleModal) closeScheduleModal();
  });

  scheduleConfirmBtn.addEventListener('click', () => {
    const scheduleDateInput = document.getElementById('scheduleDateInput');
    const selectedDate = scheduleDateInput.value;

    if (!selectedDate) {
      showToast('Please select a date and time');
      return;
    }
    schedulePostAt(selectedDate);
  });

  // ──── Paste Formatting Modal ────
  const pasteModal = document.getElementById('pasteFormattingModal');
  const pasteRemoveBtn = document.getElementById('pasteRemoveBtn');
  const pasteKeepBtn = document.getElementById('pasteKeepBtn');
  let activeTextarea = null;
  let capturedPlainText = null;
  let capturedHtmlText = null;

  // Function to setup paste listeners
  function setupPasteListeners() {
    const textFields = ['#cpTitle', '#cpPreamble', '#cpBody', '#cpBoilerplate', '#cpNotifSubject'];
    
    textFields.forEach((selector) => {
      const field = document.querySelector(selector);
      if (field) {
        // Remove any existing listeners first to avoid duplicates
        field.removeEventListener('paste', handlePaste);
        field.addEventListener('paste', handlePaste);
      }
    });
  }

  // Handle paste event with async clipboard capture
  async function handlePaste(e) {
    e.preventDefault();
    
    activeTextarea = e.target;
    capturedPlainText = null;
    capturedHtmlText = null;
    
    const items = e.clipboardData.items;
    
    // Capture both HTML and plain text
    for (let item of items) {
      if (item.kind === 'string') {
        if (item.type === 'text/html' && !capturedHtmlText) {
          capturedHtmlText = await new Promise((resolve) => {
            item.getAsString(resolve);
          });
        } else if (item.type === 'text/plain' && !capturedPlainText) {
          capturedPlainText = await new Promise((resolve) => {
            item.getAsString(resolve);
          });
        }
      }
    }
    
    console.log('Paste event triggered on', e.target.id);
    console.log('Captured plain text:', capturedPlainText);
    console.log('Captured HTML text:', capturedHtmlText);
    
    // Show modal after capturing both
    pasteModal.style.display = 'flex';
  }

  // Setup listeners on initial load
  setupPasteListeners();

  // Reattach listeners when switching tabs (in case content changes)
  const stepTabs = document.querySelectorAll('.cp-step-tab');
  stepTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setTimeout(setupPasteListeners, 100);
    });
  });

  // Handle "Remove" button - paste as plain text
  pasteRemoveBtn.addEventListener('click', () => {
    if (activeTextarea && capturedPlainText) {
      activeTextarea.value += capturedPlainText;
      activeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('Pasted plain text');
      pasteModal.style.display = 'none';
      activeTextarea = null;
      capturedPlainText = null;
      capturedHtmlText = null;
    } else {
      console.warn('No active textarea or plain text available');
    }
  });

  // Handle "Keep" button - paste as-is (with formatting)
  pasteKeepBtn.addEventListener('click', () => {
    if (activeTextarea) {
      // Use HTML if available, otherwise plain text
      const textToPaste = capturedHtmlText || capturedPlainText || '';
      activeTextarea.value += textToPaste;
      activeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('Pasted formatted text:', textToPaste);
      pasteModal.style.display = 'none';
      activeTextarea = null;
      capturedPlainText = null;
      capturedHtmlText = null;
    } else {
      console.warn('No active textarea available');
    }
  });

  // Close modal when clicking outside
  pasteModal.addEventListener('click', (e) => {
    if (e.target === pasteModal) {
      pasteModal.style.display = 'none';
      activeTextarea = null;
      capturedPlainText = null;
      capturedHtmlText = null;
    }
  });
});

function goToSettings() {
  window.location.href = "settings.html";
}

function logout() {
  window.location.href = "index.html";
}

