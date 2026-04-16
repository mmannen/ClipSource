// ── Data ──────────────────────────────────────────────────────────────────────

const BASE_ROWS = [
  { title: "Bianca Ingrosso åter som programledare för Melodifestivalen 2027",  b1: { label: "Highlights",       cls: "badge-grey" }, b2: { label: "Published",   cls: "badge-green" }, date: "Mar 26, 2026, 09:29 AM", highlight: true, thumb: "assets/post-1.jpg"  },
  { title: "Avsnitt 8 av Bonusfamiljen ute nu på SVT Play",                     b1: { label: "Highlights",       cls: "badge-grey" }, b2: { label: "Published",   cls: "badge-green" }, date: "Mar 26, 2026, 09:29 AM", highlight: true, thumb: "assets/post-2.jpg"  },
  { title: "TV4 lanserar ny dramaserie – Vinterviken hösten 2026",              b1: { label: "Highlights",       cls: "badge-grey" }, b2: { label: "Unpublished", cls: "badge-red"   }, date: "Mar 26, 2026, 09:29 AM", highlight: true, thumb: "assets/post-3.jpg"  },
  { title: "Zlatan Ibrahimović gästar Skavlan på fredag",                       b1: { label: "Press release", cls: "badge-grey" }, b2: { label: "Published",   cls: "badge-green" }, date: "Mar 26, 2026, 09:29 AM", highlight: false, thumb: "assets/post-4.jpg" },
  { title: "Sveriges Radio P3 startar ny podd med Kodjo Akolor",                b1: { label: "Press release", cls: "badge-grey" }, b2: { label: "Published",   cls: "badge-green" }, date: "Mar 26, 2026, 09:29 AM", highlight: false, thumb: "assets/post-5.jpg" },
];

const EXTRA_ROW_TEMPLATES = [
  { b1: { label: "Highlights",       cls: "badge-grey" }, b2: { label: "Published",   cls: "badge-green" } },
  { b1: { label: "Press release", cls: "badge-grey" }, b2: { label: "Unpublished", cls: "badge-red"   } },
];

const EXTRA_TITLES = [
  "Netflix Sverige: Snöfall säsong 2 – premiär 15 maj",
  "Rickard Söderberg ny programledare för Fångarna på fortet",
  "Pernilla Wahlgren gästar Så mycket bättre hösten 2026",
  "Viaplay bekräftar Husläkarna – ny medicinsk serie från mars",
  "TV3 lanserar Robinson 2027 – inspelning börjar i sommar",
  "Carola Häggkvist medverkar i Stjärnornas stjärna på SVT",
  "Idol 2026: Auditions startar i Göteborg den 2 maj",
  "Kristian Luuk återvänder med ny talk-show på TV4 i september",
];

const EXTRA_DATES = [
  "Mar 20, 2026, 11:14 AM",
  "Mar 18, 2026, 08:55 AM",
  "Mar 14, 2026, 03:02 PM",
  "Mar 10, 2026, 10:45 AM",
  "Mar 05, 2026, 02:30 PM",
];

const CONTACT_ROWS = [
  { email: "elin.andersson@svt.se", company: "SVT Nyheter", groups: "Broadcast", added: "2026-02-26", status: "pending" },
  { email: "johan.nilsson@tv4.se", company: "TV4 Nyheterna", groups: "Broadcast", added: "2026-03-27", status: "inactive" },
  { email: "sara.lind@aftonbladet.se", company: "Aftonbladet", groups: "National press", added: "2026-03-27", status: "hard-bounce" },
  { email: "oskar.bergstrom@expressen.se", company: "Expressen", groups: "National press", added: "2026-03-27", status: "inactive" },
  { email: "maria.holm@dn.se", company: "Dagens Nyheter", groups: "National press", added: "2026-03-27", status: "unapproved" },
  { email: "erik.sjogren@svd.se", company: "Svenska Dagbladet", groups: "National press", added: "2025-02-19", status: "bounce" },
  { email: "linnea.karlsson@sverigesradio.se", company: "Sveriges Radio", groups: "Digital media", added: "2026-03-27", status: "active" },
  { email: "fredrik.eklund@gp.se", company: "Göteborgs-Posten", groups: "Regional press", added: "2025-02-19", status: "inactive" },
  { email: "emma.norberg@di.se", company: "Dagens Industri", groups: "Digital media", added: "2026-03-27", status: "active" },
  { email: "henrik.olsson@tt.se", company: "TT Nyhetsbyrån", groups: "Newswire", added: "2026-03-27", status: "pending" },
  { email: "klara.westin@sydsvenskan.se", company: "Sydsvenskan", groups: "Regional press", added: "2026-01-30", status: "inactive" },
];

// ── State ─────────────────────────────────────────────────────────────────────

let openSection   = "media-center"; // "media-center" | "screening-room" | null
let selectedSR    = null;           // string | null
let highlightOnly = false;
let statusFilter  = "all";
let categoryFilter = "all";
let loadPage      = 0;
let activeRowMenu = null;
let activeRowForMenu = null;
let activeMenuTrigger = null;
let contactsState = {
  search: "",
  status: "all",
  group: "all",
};

// ── Bootstrap ─────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.style.cursor = 'pointer';
    navLogo.addEventListener('click', () => {
      window.location.href = 'medicenter.html';
    });
  }

  setupCreatePostStyleSidebar();

  // Wire sidebar nav items
  document.querySelectorAll(".nav-item").forEach((item) => {
    if (item.dataset.label) return;
    item.addEventListener("click", () => handleNavItemClick(item));
  });

  // Highlight toggle
  const hlLabel = document.getElementById("highlightLabel");
  const hlCheck = document.getElementById("highlightCheck");
  const hlText  = document.getElementById("highlightText");
  if (hlLabel) {
    hlLabel.addEventListener("click", () => {
      highlightOnly = !highlightOnly;
      hlCheck.classList.toggle("checked", highlightOnly);
      hlLabel.classList.toggle("is-active", highlightOnly);
      const checkIcon = hlCheck.querySelector(".check-icon");
      if (checkIcon) checkIcon.style.display = highlightOnly ? "block" : "none";
      applyHighlightFilter();
    });
  }

  // Load more
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      loadPage++;
      appendExtraRows(loadPage);
    });
  }

  // Search filter (live)
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => applyHighlightFilter());
  }

  setupStatusDropdown();
  setupCategoryDropdown();

  // Help button toast
  setupHelpButtonToast();

  // Three-dot row action menu
  setupRowActionMenu();

  // Load stored posts from localStorage (only on screeningroom.html, not on medicenter.html)
  if (window.location.pathname.endsWith("screeningroom.html") || window.location.pathname.endsWith("/")) {
    loadStoredPosts();
  }

  // Check if we should show contacts panel on load
  if (sessionStorage.getItem('showContactsPanelOnLoad')) {
    sessionStorage.removeItem('showContactsPanelOnLoad');
    // Delay slightly to ensure DOM is fully ready
    setTimeout(() => goToContacts(), 100);
  }

  // Check if we should show pages on load
  if (sessionStorage.getItem('showPagesOnLoad')) {
    sessionStorage.removeItem('showPagesOnLoad');
    // Delay slightly to ensure DOM is fully ready
    setTimeout(() => showUnderConstructionView("Pages"), 100);
  }
});

function setupCreatePostStyleSidebar() {
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

    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'acc-items';
    itemsWrap.style.maxHeight = '0';
    itemsWrap.style.overflow = 'hidden';
    itemsWrap.style.transition = 'max-height 0.3s ease';

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

        if (itemLabel === 'Pages') {
          sessionStorage.setItem('showPagesOnLoad', 'true');
          window.location.href = 'screeningroom.html';
          return;
        }

        sessionStorage.setItem('sr_target_section', section);
        sessionStorage.setItem('sr_target_item', itemLabel);
        window.location.href = 'screeningroom.html';
      });
    });

    header.parentNode.insertBefore(itemsWrap, header.nextSibling);
    collapsedGroups.push({ header, itemsWrap });
  });

  let openAccordionItem = null;

  collapsedGroups.forEach(({ header, itemsWrap }) => {
    header.style.cursor = 'pointer';
    itemsWrap.dataset.open = 'false';
    const section = header.closest('.accordion-section') || header.parentElement;

    header.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = itemsWrap.dataset.open === 'true';

      document.querySelectorAll('.accordion-section[id^="acc-"]').forEach((sec) => {
        sec.classList.remove('is-open');
      });

      collapsedGroups.forEach((group) => {
        group.itemsWrap.style.maxHeight = '0';
        group.itemsWrap.dataset.open = 'false';
        const grpSection = group.header.closest('.accordion-section') || group.header.parentElement;
        if (grpSection) grpSection.classList.remove('is-open');
      });

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

  document.querySelectorAll('.acc-header[data-target]').forEach((header) => {
    if (header.classList.contains('collapsed-only')) return;
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = header.dataset.target;
      const section = document.getElementById('acc-' + target);
      if (!section) return;

      if (openAccordionItem === target && section.classList.contains('is-open')) {
        section.classList.remove('is-open');
        openAccordionItem = null;
      } else {
        collapsedGroups.forEach((group) => {
          group.itemsWrap.style.maxHeight = '0';
          group.itemsWrap.dataset.open = 'false';
          const grpSection = group.header.closest('.accordion-section') || group.header.parentElement;
          if (grpSection) grpSection.classList.remove('is-open');
        });

        document.querySelectorAll('.accordion-section[id^="acc-"]').forEach((sec) => {
          if (sec.id !== 'acc-' + target) sec.classList.remove('is-open');
        });

        section.classList.add('is-open');
        openAccordionItem = target;
      }
    });
  });
}

function setupRowActionMenu() {
  const contentList = document.getElementById("contentList");
  if (!contentList) return;

  activeRowMenu = document.createElement("div");
  activeRowMenu.id = "rowActionMenu";
  activeRowMenu.className = "row-action-menu";
  activeRowMenu.innerHTML = `
    <button class="ram-item" data-action="edit">Edit</button>
    <button class="ram-item" data-action="copy">Copy post</button>
    <button class="ram-item is-danger" data-action="delete">Delete</button>
    <div class="ram-confirm ram-confirm-delete" id="ramConfirmDelete">
      <p class="ram-confirm-text">Delete this post?</p>
      <div class="ram-confirm-actions">
        <button class="ram-confirm-btn yes" data-action="confirm-delete">Yes</button>
        <button class="ram-confirm-btn no" data-action="cancel-delete">No</button>
      </div>
    </div>
    <div class="ram-divider"></div>
    <button class="ram-item" data-action="toggle-publish" id="ramTogglePublish">Unpublish</button>
    <div class="ram-confirm ram-confirm-publish" id="ramConfirmPublish">
      <p class="ram-confirm-text" id="ramPublishConfirmText">Unpublish this post?</p>
      <div class="ram-confirm-actions">
        <button class="ram-confirm-btn yes" data-action="confirm-toggle-publish">Yes</button>
        <button class="ram-confirm-btn no" data-action="cancel-toggle-publish">No</button>
      </div>
    </div>
    <div class="ram-divider"></div>
    <button class="ram-item" data-action="preview">Preview</button>
    <div class="ram-divider"></div>
    <button class="ram-item" data-action="statistics">Statistics</button>
    <button class="ram-item" data-action="record">Record of actions</button>
    <div class="ram-divider"></div>
    <button class="ram-item" data-action="share">Share within the organisation</button>
  `;
  document.body.appendChild(activeRowMenu);

  contentList.addEventListener("click", (event) => {
    const trigger = event.target.closest(".dots-menu");
    if (!trigger) return;

    event.stopPropagation();
    const row = trigger.closest(".content-row");
    if (!row) return;

    if (activeRowForMenu === row && activeRowMenu.classList.contains("open")) {
      closeRowActionMenu();
      return;
    }

    openRowActionMenu(trigger, row);
  });

  contentList.addEventListener("click", (event) => {
    if (event.target.closest(".dots-menu")) return;
    if (event.target.closest(".row-action-menu")) return;

    const row = event.target.closest(".content-row");
    if (!row) return;
    openPostEditor(row);
  });

  activeRowMenu.addEventListener("click", (event) => {
    const menuItem = event.target.closest(".ram-item");
    const confirmItem = event.target.closest(".ram-confirm-btn");
    if (!activeRowForMenu) return;

    if (menuItem) {
      const action = menuItem.dataset.action;
      if (action === "edit") {
        openPostEditor(activeRowForMenu);
        closeRowActionMenu();
        return;
      }

      if (action === "delete") {
        activeRowMenu.classList.remove("confirming-publish");
        activeRowMenu.classList.add("confirming-delete");
        return;
      }

      if (action === "toggle-publish") {
        activeRowMenu.classList.remove("confirming-delete");
        activeRowMenu.classList.add("confirming-publish");
        return;
      }

      closeRowActionMenu();
      return;
    }

    if (confirmItem) {
      const action = confirmItem.dataset.action;
      if (action === "confirm-delete") {
        deleteRow(activeRowForMenu);
        closeRowActionMenu();
        return;
      }

      if (action === "cancel-delete") {
        activeRowMenu.classList.remove("confirming-delete");
      }

      if (action === "confirm-toggle-publish") {
        toggleRowPublish(activeRowForMenu);
        closeRowActionMenu();
      }

      if (action === "cancel-toggle-publish") {
        activeRowMenu.classList.remove("confirming-publish");
      }
      return;
    }
  });

  document.addEventListener("click", (event) => {
    if (!activeRowMenu.classList.contains("open")) return;
    if (activeRowMenu.contains(event.target)) return;
    closeRowActionMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeRowActionMenu();
    }
  });

  window.addEventListener("resize", closeRowActionMenu);
  window.addEventListener("scroll", closeRowActionMenu, true);
}

function openRowActionMenu(trigger, row) {
  if (!activeRowMenu) return;

  const rect = trigger.getBoundingClientRect();
  const menuWidth = 320;
  const viewportPadding = 10;
  const top = Math.min(window.innerHeight - 20, rect.top + rect.height / 2);
  const preferredLeft = rect.right + 8;
  const left = Math.min(
    window.innerWidth - menuWidth - viewportPadding,
    Math.max(viewportPadding, preferredLeft)
  );

  activeRowForMenu = row;
  activeMenuTrigger = trigger;
  trigger.setAttribute("aria-expanded", "true");

  const publishToggleBtn = activeRowMenu.querySelector("#ramTogglePublish");
  const publishConfirmText = activeRowMenu.querySelector("#ramPublishConfirmText");
  const shouldUnpublish = isRowPublished(row);
  if (publishToggleBtn) {
    publishToggleBtn.textContent = shouldUnpublish ? "Unpublish" : "Publish";
  }
  if (publishConfirmText) {
    publishConfirmText.textContent = shouldUnpublish ? "Unpublish this post?" : "Publish this post?";
  }

  activeRowMenu.style.top = `${top}px`;
  activeRowMenu.style.left = `${left}px`;
  activeRowMenu.classList.remove("confirming-delete");
  activeRowMenu.classList.remove("confirming-publish");
  activeRowMenu.classList.add("open");
}

function closeRowActionMenu() {
  if (!activeRowMenu) return;
  activeRowMenu.classList.remove("confirming-delete");
  activeRowMenu.classList.remove("confirming-publish");
  activeRowMenu.classList.remove("open");
  if (activeMenuTrigger) activeMenuTrigger.setAttribute("aria-expanded", "false");
  activeMenuTrigger = null;
  activeRowForMenu = null;
}

function deleteRow(row) {
  const postId = row.dataset.postId;
  if (postId) {
    const stored = JSON.parse(localStorage.getItem("mc_posts") || "[]");
    const updated = stored.filter((post) => String(post.id) !== String(postId));
    localStorage.setItem("mc_posts", JSON.stringify(updated));
  }

  row.remove();
  applyHighlightFilter();
}

function isRowPublished(row) {
  const statusBadge = findStatusBadge(row);
  if (!statusBadge) return false;
  return statusBadge.textContent.trim().toLowerCase() === "published";
}

function findStatusBadge(row) {
  const badges = Array.from(row.querySelectorAll(".row-badges .badge"));
  return badges.find((badge) => {
    // Skip category badges (which have grey class)
    if (badge.classList.contains("badge-grey")) return false;
    const val = badge.textContent.trim().toLowerCase();
    return val === "published" || val === "unpublished" || val === "draft" || val.startsWith("scheduled");
  }) || badges[badges.length - 1] || null;
}

function toggleRowPublish(row) {
  const statusBadge = findStatusBadge(row);
  if (!statusBadge) return;

  const nextIsPublished = !isRowPublished(row);
  statusBadge.textContent = nextIsPublished ? "Published" : "Unpublished";
  statusBadge.classList.remove("badge-green", "badge-red", "badge-grey");
  statusBadge.classList.add(nextIsPublished ? "badge-green" : "badge-red");

  if (row.dataset.postId) {
    const stored = JSON.parse(localStorage.getItem("mc_posts") || "[]");
    const updated = stored.map((post) => {
      if (String(post.id) !== String(row.dataset.postId)) return post;
      return {
        ...post,
        status: nextIsPublished ? "published" : "unpublished",
      };
    });
    localStorage.setItem("mc_posts", JSON.stringify(updated));
  }
}

function openPostEditor(row) {
  const title = row.querySelector(".row-title")?.textContent.trim() || "";
  const badges = Array.from(row.querySelectorAll(".row-badges .badge"));
  const category = badges[0]?.textContent.trim() || "Highlights";
  const status = isRowPublished(row) ? "published" : "unpublished";
  const thumb = row.querySelector(".thumb")?.style.backgroundImage || "";
  const thumbMatch = thumb.match(/^url\(["']?(.*?)["']?\)$/);
  const thumbUrl = thumbMatch ? thumbMatch[1] : null;

  if (row.dataset.postId) {
    window.location.href = `createpost.html?editId=${encodeURIComponent(row.dataset.postId)}`;
    return;
  }

  const tempPayload = {
    title,
    category,
    status,
    highlight: row.dataset.highlight === "true",
    thumb: thumbUrl,
  };

  sessionStorage.setItem("mc_edit_post_temp", JSON.stringify(tempPayload));
  window.location.href = "createpost.html?editTemp=1";
}

// ── Accordion Logic ───────────────────────────────────────────────────────────

function handleAccordionClick(target) {
  if (openSection === target) {
    // Collapse it
    setAccordionOpen(target, false);
    openSection = null;
  } else {
    // Close current, open new
    if (openSection) setAccordionOpen(openSection, false);
    setAccordionOpen(target, true);
    openSection = target;
  }
}

function setAccordionOpen(sectionId, isOpen) {
  const section = document.getElementById("acc-" + sectionId);
  if (!section) return;
  section.classList.toggle("is-open", isOpen);
}

// ── Nav-item click ────────────────────────────────────────────────────────────

function handleNavItemClick(item) {
  const section = item.dataset.section;
  const label = item.querySelector("span")?.textContent.trim() || "";

  if (section === "media-center") {
    if (label === "Posts") {
      if (!window.location.pathname.endsWith("medicenter.html")) {
        window.location.href = "medicenter.html";
        return;
      }

      if (item.classList.contains("active")) return;

      document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      selectedSR = null;
      showPostsView();
      return;
    }

    if (label === "Contacts") {
      document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      selectedSR = null;
      showContactsView();
      return;
    }

    if (label === "Pages") {
      document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      selectedSR = null;
      showUnderConstructionView(label);
      return;
    }

    // If already active, do nothing
    if (item.classList.contains("active")) return;

    // Activate item and show placeholder for unimplemented pages
    document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
    selectedSR = null;
    showUnderConstructionView(label);
    return;
  }

  // All other sections currently have no dedicated content page yet.
  if (item.classList.contains("active")) return;

  document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
  item.classList.add("active");
  selectedSR = label;
  showUnderConstructionView(label);
}

// ── View switching ────────────────────────────────────────────────────────────

function openSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.remove('closed');
  }
  document.querySelectorAll('.nav-links span').forEach((span) => span.classList.remove('active'));
}

function showPostsView() {
  openSidebar();
  const pv = document.getElementById("posts-view");
  const sv = document.getElementById("sr-view");
  const pagesView = document.getElementById("pages-view");
  if (pv) pv.style.display = "";
  if (sv) sv.style.display = "none";
  if (pagesView) pagesView.style.display = "none";
  loadStoredPosts();
}

function loadStoredPosts() {
  const contentList = document.getElementById("contentList");
  if (!contentList) return;

  const stored = JSON.parse(localStorage.getItem("mc_posts") || "[]");
  
  // Remove any previously loaded stored posts (keep hardcoded rows)
  document.querySelectorAll(".content-row[data-post-id]").forEach(row => row.remove());
  
  if (stored.length === 0) return;

  const DOTS_SVG = `
    <div class="dots-menu" aria-label="Options">
      <svg width="4" height="4" viewBox="0 0 5 5"><circle cx="2.5" cy="2.5" r="2.5" fill="#747474"/></svg>
      <svg width="4" height="4" viewBox="0 0 5 5"><circle cx="2.5" cy="2.5" r="2.5" fill="#747474"/></svg>
      <svg width="4" height="4" viewBox="0 0 5 5"><circle cx="2.5" cy="2.5" r="2.5" fill="#747474"/></svg>
    </div>`;

  stored.forEach((post) => {
    const row = document.createElement("div");
    row.className = "content-row";
    row.dataset.highlight = post.highlight ? "true" : "false";
    row.dataset.status = post.status || "published";
    row.dataset.postId = String(post.id);
    if (post.id !== undefined && post.id !== null) {
      row.dataset.postId = String(post.id);
    }

    const statusBadge = post.status === "published"
      ? '<span class="badge badge-green">Published</span>'
      : post.status === "scheduled"
      ? `<span class="badge badge-lilac">Scheduled ${post.scheduledDate || ""}</span>`
      : '<span class="badge badge-red">Unpublished</span>';

    const categoryBadge = `<span class="badge badge-grey">${post.category}</span>`;
    
    const highlightBadge = post.highlight
      ? '<span class="badge badge-highlight"><strong>H</strong> Highlighted</span>'
      : '';

    const thumbStyle = post.thumb
      ? `background-image:url('${post.thumb}');background-size:cover;background-position:center;background-color:#d9d9d9`
      : "background-color:#d9d9d9";

    row.innerHTML = `
      <div class="thumb" style="${thumbStyle}"></div>
      <div class="row-info">
        <p class="row-title">${post.title}</p>
        <div class="row-badges">${categoryBadge}${highlightBadge}${statusBadge}</div>
      </div>
      <span class="row-date">${post.publishedAt}</span>
      ${DOTS_SVG}`;

    const firstRow = contentList.querySelector(".content-row");
    if (firstRow) {
      contentList.insertBefore(row, firstRow);
    } else {
      contentList.appendChild(row);
    }
  });
}

function showSRView() {
  openSidebar();
  const pv = document.getElementById("posts-view");
  const pagesView = document.getElementById("pages-view");
  const sv = document.getElementById("sr-view");
  if (pv) pv.style.display = "none";
  if (pagesView) pagesView.style.display = "none";
  if (sv) sv.style.display = "";
}

function showUnderConstructionView(label) {
  const pv = document.getElementById("posts-view");
  const pagesView = document.getElementById("pages-view");
  const sv = document.getElementById("sr-view");
  if (pv) pv.style.display = "none";
  if (pagesView) pagesView.style.display = "none";
  if (!sv) return;

  sv.style.display = "";
  const sectionLabel = label || "This page";
  sv.innerHTML = `
    <div class="under-construction-state" role="status" aria-live="polite">
      <svg class="under-construction-icon" viewBox="0 0 640 640" aria-hidden="true">
        <path d="M355.1 110.4L589.8 516.8C602.5 538.8 586.6 566.4 561.2 566.4L90.8 566.4C65.4 566.4 49.5 538.8 62.2 516.8L296.9 110.4C309.6 88.4 342.4 88.4 355.1 110.4z" fill="currentColor"/>
        <path d="M320 240C333.3 240 344 250.7 344 264L344 400C344 413.3 333.3 424 320 424C306.7 424 296 413.3 296 400L296 264C296 250.7 306.7 240 320 240zM320 456C337.7 456 352 470.3 352 488C352 505.7 337.7 520 320 520C302.3 520 288 505.7 288 488C288 470.3 302.3 456 320 456z" fill="#ffffff"/>
      </svg>
      <h2>Under construction</h2>
      <p>${sectionLabel} has no content yet.</p>
    </div>
  `;
}

function showPagesView() {
  openSidebar();
  const pv = document.getElementById("posts-view");
  const sv = document.getElementById("sr-view");
  const pagesView = document.getElementById("pages-view");
  if (pv) pv.style.display = "none";
  if (sv) sv.style.display = "none";
  if (pagesView) {
    pagesView.style.display = "flex";
    initializePageBuilder();
  }
}

function initializePageBuilder() {
  const canvas = document.getElementById("pagesCanvas");
  const pagesView = document.getElementById("pages-view");

  if (!canvas) {
    console.error("Pages canvas element not found");
    return;
  }

  // Show under construction
  canvas.innerHTML = `
    <div class="under-construction-state" role="status" aria-live="polite">
      <svg class="under-construction-icon" viewBox="0 0 640 640" aria-hidden="true">
        <path d="M355.1 110.4L589.8 516.8C602.5 538.8 586.6 566.4 561.2 566.4L90.8 566.4C65.4 566.4 49.5 538.8 62.2 516.8L296.9 110.4C309.6 88.4 342.4 88.4 355.1 110.4z" fill="currentColor"/>
        <path d="M320 240C333.3 240 344 250.7 344 264L344 400C344 413.3 333.3 424 320 424C306.7 424 296 413.3 296 400L296 264C296 250.7 306.7 240 320 240zM320 456C337.7 456 352 470.3 352 488C352 505.7 337.7 520 320 520C302.3 520 288 505.7 288 488C288 470.3 302.3 456 320 456z" fill="#ffffff"/>
      </svg>
      <h2>Under construction</h2>
      <p>Pages has no content yet.</p>
    </div>
  `;
}

function showContactsView() {
  const pv = document.getElementById("posts-view");
  const pagesView = document.getElementById("pages-view");
  const sv = document.getElementById("sr-view");
  if (pv) pv.style.display = "none";
  if (pagesView) pagesView.style.display = "none";
  if (!sv) return;

  sv.style.display = "";
  sv.dataset.setupDone = "false"; // Reset flag since innerHTML is being replaced
  sv.innerHTML = `
    <section class="contacts-view" aria-label="Contacts overview">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <button class="back-to-screening" type="button" onclick="showPostsView()" aria-label="Back to posts">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.7 5.3a1 1 0 0 1 0 1.4L10.4 12l5.3 5.3a1 1 0 1 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0Z"/>
          </svg>
        </button>
        <h2 style="margin: 0; margin-top: -2px; font-family: 'Open Sans', sans-serif; font-size: 20px; font-weight: 500; color: #222;">Contacts</h2>
      </div>
      <div class="contacts-tabs" role="tablist" aria-label="Contacts navigation">
        <button class="contacts-tab is-active" type="button" role="tab" aria-selected="true">Contacts</button>
        <button class="contacts-tab" type="button" role="tab" aria-selected="false" data-placeholder="Groups">Groups</button>
        <button class="contacts-tab" type="button" role="tab" aria-selected="false" data-placeholder="Access requests">Access requests <span class="contacts-tab-count">19</span></button>
        <button class="contacts-tab" type="button" role="tab" aria-selected="false" data-placeholder="Backups">Backups</button>
      </div>

      <div class="contacts-toolbar">
        <div class="search-box contacts-search-box">
          <input type="text" id="contactsSearchInput" placeholder="Search contacts..." />
          <button class="search-btn" type="button" aria-label="Search contacts">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11.625 10.5H11.0325L10.8225 10.2975C11.5575 9.4425 12 8.3325 12 7.125C12 4.4325 9.8175 2.25 7.125 2.25C4.4325 2.25 2.25 4.4325 2.25 7.125C2.25 9.8175 4.4325 12 7.125 12C8.3325 12 9.4425 11.5575 10.2975 10.8225L10.5 11.0325V11.625L14.25 15.3675L15.3675 14.25L11.625 10.5ZM7.125 10.5C5.2575 10.5 3.75 8.9925 3.75 7.125C3.75 5.2575 5.2575 3.75 7.125 3.75C8.9925 3.75 10.5 5.2575 10.5 7.125C10.5 8.9925 8.9925 10.5 7.125 10.5Z" fill="white"/>
            </svg>
          </button>
        </div>

        <div class="contacts-filter contacts-filter-status" id="contactsStatusDropdown" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false">
          <span class="contacts-filter-icon contacts-filter-dot" aria-hidden="true"></span>
          <span id="contactsStatusLabel" class="contacts-status-label">Status</span>
          <svg class="contacts-filter-chevron" width="6" height="8" viewBox="0 0 5.02 7.65" fill="none" aria-hidden="true"><path d="M0.233189 7.51682C-0.0775287 7.26857 -0.0777675 6.79621 0.2327 6.54764L3.63181 3.82627L0.232712 1.10488C-0.0777437 0.856326 -0.0775091 0.38398 0.233194 0.135731C0.459697 -0.0452411 0.781327 -0.0452441 1.00783 0.135724L4.64919 3.045C5.15026 3.44534 5.15026 4.2072 4.64919 4.60754L1.00783 7.51682C0.781325 7.69779 0.459696 7.69779 0.233189 7.51682Z" fill="#979797"/></svg>
          <div id="contactsStatusMenu" class="contacts-status-menu" role="listbox" aria-label="Filter contacts by status">
            <div class="contacts-status-legend">
              <div class="contacts-legend-item" data-status="all" role="button" tabindex="0">
                <span class="contacts-legend-dot black"></span>
                <div class="contacts-legend-text">
                  View all
                </div>
              </div>
              <div class="contacts-legend-item" data-status="active" role="button" tabindex="0">
                <span class="contacts-legend-dot active"></span>
                <div class="contacts-legend-text">
                  Account active/receives emails
                </div>
              </div>
              <div class="contacts-legend-item" data-status="inactive" role="button" tabindex="0">
                <span class="contacts-legend-dot inactive"></span>
                <div class="contacts-legend-text">
                  Account active/emails deactivated
                </div>
              </div>
              <div class="contacts-legend-item" data-status="bounce" role="button" tabindex="0">
                <span class="contacts-legend-dot bounce"></span>
                <div class="contacts-legend-text">
                  Account active/soft bounce
                </div>
              </div>
              <div class="contacts-legend-item" data-status="pending" role="button" tabindex="0">
                <span class="contacts-legend-dot pending"></span>
                <div class="contacts-legend-text">
                  No registered account/approved emails
                </div>
              </div>
              <div class="contacts-legend-item" data-status="unapproved" role="button" tabindex="0">
                <span class="contacts-legend-dot unapproved"></span>
                <div class="contacts-legend-text">
                  No registered account/not approved emails
                </div>
              </div>
              <div class="contacts-legend-item" data-status="hard-bounce" role="button" tabindex="0">
                <span class="contacts-legend-dot hard-bounce"></span>
                <div class="contacts-legend-text">
                  Hard bounce/emails can't be delivered
                </div>
              </div>
            </div>
          </div>
        </div>

        <label class="contacts-filter contacts-filter-groups">
          <select id="contactsGroupFilter" aria-label="Filter contacts by group">
            <option value="all">Groups</option>
            <option value="broadcast">Broadcast</option>
            <option value="digital">Digital media</option>
            <option value="newswire">Newswire</option>
            <option value="press">Press</option>
            <option value="sports">Sports media</option>
          </select>
        </label>

        <button class="contacts-actions-btn" type="button">Actions</button>
      </div>

      <div class="contacts-table-wrap">
        <table class="contacts-table">
          <thead>
            <tr>
              <th class="contacts-checkbox-col"><input type="checkbox" aria-label="Select all contacts" /></th>
              <th>Email</th>
              <th>Company</th>
              <th>Groups</th>
              <th>Added</th>
              <th>Status</th>
              <th class="contacts-menu-col"></th>
            </tr>
          </thead>
          <tbody id="contactsTableBody"></tbody>
        </table>
      </div>
      <p class="contacts-empty-state" id="contactsEmptyState" hidden>No contacts match the current filters.</p>
    </section>
  `;

  setupContactsView();
  // Delay table rendering until after sidebar animation completes (300ms should be sufficient)
  setTimeout(() => renderContactsTable(), 350);
}

function setupContactsView() {
  const sv = document.getElementById("sr-view");
  if (!sv) return;

  // Mark as setup to prevent duplicate listeners
  if (sv.dataset.setupDone === "true") return;
  sv.dataset.setupDone = "true";

  const searchInput = sv.querySelector("#contactsSearchInput");
  const statusDropdown = sv.querySelector("#contactsStatusDropdown");
  const statusLabel = sv.querySelector("#contactsStatusLabel");
  const statusMenu = sv.querySelector("#contactsStatusMenu");
  const groupFilter = sv.querySelector("#contactsGroupFilter");

  if (searchInput) {
    searchInput.value = contactsState.search;
    searchInput.addEventListener("input", (e) => {
      contactsState.search = e.target.value.trim().toLowerCase();
      renderContactsTable();
    });
  }

  // Handle status dropdown
  if (statusDropdown && statusMenu) {
    const setStatusDropdownOpen = (isOpen) => {
      statusDropdown.classList.toggle("open", isOpen);
      statusDropdown.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    const selectStatus = (value, label) => {
      contactsState.status = value;
      statusLabel.textContent = label || "Status";
      sv.querySelectorAll(".contacts-legend-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.status === value);
      });
      setStatusDropdownOpen(false);
      renderContactsTable();
    };

    statusDropdown.addEventListener("click", (event) => {
      const item = event.target.closest(".contacts-legend-item");
      if (item) {
        event.stopPropagation();
        const statusValue = item.dataset.status;
        const textContent = item.querySelector(".contacts-legend-text").textContent.trim();
        selectStatus(statusValue, textContent);
        return;
      }
      setStatusDropdownOpen(!statusDropdown.classList.contains("open"));
    });

    statusDropdown.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target === statusDropdown) {
        event.preventDefault();
        setStatusDropdownOpen(!statusDropdown.classList.contains("open"));
        return;
      }
      if (event.key === "Escape") {
        setStatusDropdownOpen(false);
        statusDropdown.focus();
      }
    });

    // Initialize status label and active item
    const activeItem = sv.querySelector(`.contacts-legend-item[data-status="${contactsState.status}"]`);
    if (activeItem) {
      activeItem.classList.add("active");
      statusLabel.textContent = activeItem.querySelector(".contacts-legend-text").textContent.trim();
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!statusDropdown.contains(e.target) && statusDropdown.classList.contains("open")) {
        const setStatusDropdownOpen = (isOpen) => {
          statusDropdown.classList.toggle("open", isOpen);
          statusDropdown.setAttribute("aria-expanded", isOpen ? "true" : "false");
        };
        setStatusDropdownOpen(false);
      }
    }, true);
  }

  if (groupFilter) {
    groupFilter.value = contactsState.group;
    groupFilter.addEventListener("change", (e) => {
      contactsState.group = e.target.value;
      renderContactsTable();
    });
  }

  // Use event delegation for tabs to prevent duplicate listener attachment
  const tabsContainer = sv.querySelector(".contacts-tabs");
  if (tabsContainer) {
    tabsContainer.addEventListener("click", (e) => {
      const tab = e.target.closest(".contacts-tab");
      if (!tab) return;
      
      // Update active tab styling
      sv.querySelectorAll(".contacts-tab").forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      
      const tableWrap = sv.querySelector(".contacts-table-wrap");
      const emptyState = sv.querySelector(".contacts-empty-state");
      
      // Check if this is the "Contacts" tab (no data-placeholder) or another tab
      if (!tab.dataset.placeholder) {
        // Show the actual contacts table
        if (tableWrap) {
          tableWrap.innerHTML = `
            <table class="contacts-table">
              <thead>
                <tr>
                  <th class="contacts-checkbox-col"><input type="checkbox" aria-label="Select all contacts" /></th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Groups</th>
                  <th>Added</th>
                  <th>Status</th>
                  <th class="contacts-menu-col"></th>
                </tr>
              </thead>
              <tbody id="contactsTableBody"></tbody>
            </table>
          `;
          renderContactsTable();
        }
        if (emptyState) {
          emptyState.hidden = true;
        }
      } else {
        // Show under-construction for other tabs
        if (tableWrap) {
          tableWrap.innerHTML = `
            <div class="under-construction-state" role="status" aria-live="polite">
              <svg class="under-construction-icon" viewBox="0 0 640 640" aria-hidden="true">
                <path d="M355.1 110.4L589.8 516.8C602.5 538.8 586.6 566.4 561.2 566.4L90.8 566.4C65.4 566.4 49.5 538.8 62.2 516.8L296.9 110.4C309.6 88.4 342.4 88.4 355.1 110.4z" fill="currentColor"/>
                <path d="M320 240C333.3 240 344 250.7 344 264L344 400C344 413.3 333.3 424 320 424C306.7 424 296 413.3 296 400L296 264C296 250.7 306.7 240 320 240zM320 456C337.7 456 352 470.3 352 488C352 505.7 337.7 520 320 520C302.3 520 288 505.7 288 488C288 470.3 302.3 456 320 456z" fill="#ffffff"/>
              </svg>
              <h2>Under construction</h2>
              <p>${tab.dataset.placeholder} has no content yet.</p>
            </div>
          `;
        }
        if (emptyState) {
          emptyState.hidden = true;
        }
      }
    });
  }
}

function getFilteredContacts() {
  return CONTACT_ROWS.filter((row) => {
    const searchTarget = `${row.email} ${row.company} ${row.groups}`.toLowerCase();
    const matchesSearch = !contactsState.search || searchTarget.includes(contactsState.search);
    const matchesStatus = contactsState.status === "all" || row.status === contactsState.status;
    const normalizedGroup = row.groups.toLowerCase();
    const matchesGroup = contactsState.group === "all"
      || (contactsState.group === "press" && normalizedGroup.includes("press"))
      || (contactsState.group === "sports" && normalizedGroup.includes("sports"))
      || (contactsState.group === "digital" && normalizedGroup.includes("digital"))
      || (contactsState.group === "newswire" && normalizedGroup.includes("newswire"))
      || (contactsState.group === "broadcast" && normalizedGroup.includes("broadcast"));
    return matchesSearch && matchesStatus && matchesGroup;
  });
}

function renderContactsTable() {
  const tbody = document.getElementById("contactsTableBody");
  const emptyState = document.getElementById("contactsEmptyState");
  if (!tbody || !emptyState) return;

  const rows = getFilteredContacts();
  tbody.innerHTML = rows.map((row) => `
    <tr>
      <td class="contacts-checkbox-col"><input type="checkbox" aria-label="Select ${escapeHtml(row.email)}" /></td>
      <td class="contacts-email">${escapeHtml(row.email)}</td>
      <td>${escapeHtml(row.company)}</td>
      <td>
        <span class="contacts-group-chip" title="${escapeHtml(row.groups)}">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 6C7 4.34375 8.34375 3 10 3C11.6562 3 13 4.34375 13 6C13 7.65625 11.6562 9 10 9C8.34375 9 7 7.65625 7 6ZM14 6C14 3.79063 12.2094 2 10 2C7.79063 2 6 3.79063 6 6C6 8.20937 7.79063 10 10 10C12.2094 10 14 8.20937 14 6ZM4 17C4 14.5156 6.01562 12.5 8.5 12.5H11.5C13.9844 12.5 16 14.5156 16 17V17.5C16 17.775 16.225 18 16.5 18C16.775 18 17 17.775 17 17.5V17C17 13.9625 14.5375 11.5 11.5 11.5H8.5C5.4625 11.5 3 13.9625 3 17V17.5C3 17.775 3.225 18 3.5 18C3.775 18 4 17.775 4 17.5V17Z" fill="currentColor"/></svg>
          <span>${escapeHtml(row.groups)}</span>
        </span>
      </td>
      <td>${escapeHtml(row.added)}</td>
      <td><span class="contacts-status-dot is-${row.status}" aria-label="${escapeHtml(row.status)}"></span></td>
      <td class="contacts-menu-col">
        <button class="contacts-row-menu" type="button" aria-label="Contact actions">
          <svg width="4" height="16" viewBox="0 0 4 16" aria-hidden="true">
            <circle cx="2" cy="2" r="1.5" fill="currentColor"/>
            <circle cx="2" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="2" cy="14" r="1.5" fill="currentColor"/>
          </svg>
        </button>
      </td>
    </tr>
  `).join("");

  emptyState.hidden = rows.length > 0;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setupStatusDropdown() {
  const dropdown = document.getElementById("statusDropdown");
  const dropdownLabel = document.getElementById("statusDropdownLabel");
  const dropdownMenu = document.getElementById("statusDropdownMenu");
  if (!dropdown || !dropdownLabel || !dropdownMenu) return;

  const options = Array.from(dropdownMenu.querySelectorAll(".status-option"));

  const setOpen = (isOpen) => {
    dropdown.classList.toggle("open", isOpen);
    dropdown.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  const selectStatus = (value, label) => {
    statusFilter = value;
    dropdownLabel.textContent = label;
    options.forEach((option) => {
      option.classList.toggle("active", option.dataset.status === value);
    });
    setOpen(false);
    applyHighlightFilter();
  };

  dropdown.addEventListener("click", (event) => {
    const option = event.target.closest(".status-option");
    if (option) {
      event.stopPropagation();
      selectStatus(option.dataset.status, option.textContent.trim());
      return;
    }

    setOpen(!dropdown.classList.contains("open"));
  });

  dropdown.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target === dropdown) {
      event.preventDefault();
      setOpen(!dropdown.classList.contains("open"));
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      dropdown.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      setOpen(false);
    }
  });
}

function setupCategoryDropdown() {
  const dropdown = document.getElementById("categoryDropdown");
  const dropdownLabel = document.getElementById("categoryDropdownLabel");
  const dropdownMenu = document.getElementById("categoryDropdownMenu");
  if (!dropdown || !dropdownLabel || !dropdownMenu) return;

  const options = Array.from(dropdownMenu.querySelectorAll(".status-option"));

  const setOpen = (isOpen) => {
    dropdown.classList.toggle("open", isOpen);
    dropdown.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  const selectCategory = (value, label) => {
    categoryFilter = value;
    dropdownLabel.textContent = label;
    options.forEach((option) => {
      option.classList.toggle("active", option.dataset.category === value);
    });
    setOpen(false);
    applyHighlightFilter();
  };

  dropdown.addEventListener("click", (event) => {
    const option = event.target.closest(".status-option");
    if (option) {
      event.stopPropagation();
      selectCategory(option.dataset.category, option.textContent.trim());
      return;
    }

    setOpen(!dropdown.classList.contains("open"));
  });

  dropdown.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target === dropdown) {
      event.preventDefault();
      setOpen(!dropdown.classList.contains("open"));
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      dropdown.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      setOpen(false);
    }
  });
}

function rowMatchesStatusFilter(row) {
  if (statusFilter === "all") return true;

  const primaryBadge = row.querySelector(".row-badges .badge")?.textContent.toLowerCase().trim() || "";
  const statusBadge = findStatusBadge(row)?.textContent.toLowerCase().trim() || "";

  if (statusFilter === "scheduled") {
    return statusBadge.startsWith("scheduled");
  }

  if (statusFilter === "published") {
    return statusBadge === "published";
  }

  if (statusFilter === "unpublished") {
    return statusBadge === "unpublished";
  }

  if (statusFilter === "not-published") {
    return statusBadge === "unpublished" || statusBadge === "draft" || statusBadge === "not published";
  }

  return true;
}

function rowMatchesCategoryFilter(row) {
  if (categoryFilter === "all") return true;

  // When a category filter is applied, don't show posts with "Scheduled" status
  const statusBadge = findStatusBadge(row)?.textContent.toLowerCase().trim() || "";
  if (statusBadge.startsWith("scheduled")) {
    return false;
  }

  const primaryBadge = row.querySelector(".row-badges .badge")?.textContent.toLowerCase().trim() || "";

  if (categoryFilter === "highlights") {
    return primaryBadge.includes("highlight");
  }

  if (categoryFilter === "scheduled") {
    return primaryBadge.includes("scheduled");
  }

  return true;
}

// ── Highlight filter ──────────────────────────────────────────────────────────

function applyHighlightFilter() {
  const query = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const isSearching = query.length > 0;
  const hasFilters = statusFilter !== "all" || categoryFilter !== "all";

  const loadMoreWrap = document.querySelector(".load-more-wrap");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreWrap) {
    loadMoreWrap.style.display = (isSearching || hasFilters) ? "none" : "";
  }
  if (loadMoreBtn) {
    loadMoreBtn.style.display = (isSearching || hasFilters) ? "none" : "";
  }

  document.querySelectorAll(".content-row").forEach((row) => {
    const isHighlight = row.dataset.highlight === "true";
    const title = row.querySelector(".row-title")?.textContent.toLowerCase() || "";
    const matchesSearch = !query || title.includes(query);
    const matchesHighlight = !highlightOnly || isHighlight;
    const matchesStatus = rowMatchesStatusFilter(row);
    const matchesCategory = rowMatchesCategoryFilter(row);
    row.classList.toggle("hidden-row", !(matchesSearch && matchesHighlight && matchesStatus && matchesCategory));
  });
}

// ── Load more ─────────────────────────────────────────────────────────────────

function appendExtraRows(page) {
  const list = document.getElementById("contentList");
  if (!list) return;

  for (let i = 0; i < 5; i++) {
    const tmpl = EXTRA_ROW_TEMPLATES[(page * 5 + i) % EXTRA_ROW_TEMPLATES.length];
    const date = EXTRA_DATES[i % EXTRA_DATES.length];
    const isHL = tmpl.b1.label === "Highlights";

    const row = document.createElement("div");
    row.className = "content-row row-anim";
    row.dataset.highlight = isHL ? "true" : "false";
    row.innerHTML = `
      <div class="thumb"></div>
      <div class="row-info">
        <p class="row-title">${EXTRA_TITLES[(page * 5 + i) % EXTRA_TITLES.length]}</p>
        <div class="row-badges">
          <span class="badge ${tmpl.b1.cls}">${tmpl.b1.label}</span>
          <span class="badge ${tmpl.b2.cls}">${tmpl.b2.label}</span>
        </div>
      </div>
      <span class="row-date">${date}</span>
      <div class="dots-menu" aria-label="Options">
        <svg width="4" height="4" viewBox="0 0 5 5"><circle cx="2.5" cy="2.5" r="2.5" fill="#747474"/></svg>
        <svg width="4" height="4" viewBox="0 0 5 5"><circle cx="2.5" cy="2.5" r="2.5" fill="#747474"/></svg>
        <svg width="4" height="4" viewBox="0 0 5 5"><circle cx="2.5" cy="2.5" r="2.5" fill="#747474"/></svg>
      </div>`;
    list.appendChild(row);
  }

  // Re-apply filter so new rows respect current highlight-only state
  applyHighlightFilter();
}

// ── Help button toast ─────────────────────────────────────────────────────────

function setupHelpButtonToast() {
  const helpBtn = document.getElementById("helpBtn");
  if (!helpBtn) return;

  helpBtn.addEventListener("click", () => {
    const toast = ensureHelpToast();
    toast.textContent = "Need help? contact support.";
    toast.classList.add("show");
    clearTimeout(setupHelpButtonToast._timer);
    setupHelpButtonToast._timer = setTimeout(() => toast.classList.remove("show"), 1700);
  });
}

function ensureHelpToast() {
  let toast = document.getElementById("helpToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "helpToast";
    toast.className = "help-toast";
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  return toast;
}

// ── Navigation helpers ────────────────────────────────────────────────────────

function goToCreatePost() {
  window.location.href = "createpost.html";
}

function goToSettings() {
  window.location.href = "settings.html";
}

function logout() {
  window.location.href = "index.html";
}

function goToContacts() {
  // Check if sr-view exists on this page - if so, show contacts panel
  const srView = document.getElementById('sr-view');
  if (srView && typeof showContactsView === 'function') {
    // Remove active state from all nav items
    document.querySelectorAll('.nav-item').forEach((i) => i.classList.remove('active'));
    // Remove active state from all nav links
    document.querySelectorAll('.nav-links span').forEach((span) => span.classList.remove('active'));
    // Set active state on CONTACTS nav link
    document.querySelectorAll('.nav-links span').forEach((span) => {
      if (span.textContent.trim() === 'CONTACTS') {
        span.classList.add('active');
      }
    });
    // Close the sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.add('closed');
    }
    // Call the showContactsView function to display the contacts panel
    showContactsView();
  } else {
    // Navigate to screeningroom to show contacts panel
    sessionStorage.setItem('showContactsPanelOnLoad', 'true');
    window.location.href = 'screeningroom.html';
  }
}

function goToTags() {
  // Navigate to tags page (no panel version exists yet)
  window.location.href = "tags.html";
}

// ── Page Builder Helpers ──────────────────────────────────────────────────────

function addComponent(type) {
  const canvas = document.getElementById("pagesCanvas");
  const id = `comp-${Date.now()}`;
  let html = "";

  switch(type) {
    case "heading":
      html = `
        <div class="pages-component" data-id="${id}">
          <div class="pages-component-header">Heading</div>
          <h2 class="pages-component-content">New heading</h2>
        </div>
      `;
      break;
    case "text":
      html = `
        <div class="pages-component" data-id="${id}">
          <div class="pages-component-header">Text</div>
          <p class="pages-component-content">Add your text here...</p>
        </div>
      `;
      break;
    case "image":
      html = `
        <div class="pages-component" data-id="${id}">
          <div class="pages-component-header">Image</div>
          <div class="pages-component-image" style="cursor: pointer;">
            <div style="text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">🖼</div>
              <div>Click to add image</div>
            </div>
          </div>
        </div>
      `;
      break;
    case "video":
      html = `
        <div class="pages-component" data-id="${id}">
          <div class="pages-component-header">Video</div>
          <div class="pages-component-image" style="cursor: pointer; background: #f5f5f5;">
            <div style="text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">▶</div>
              <div>Click to add video</div>
            </div>
          </div>
        </div>
      `;
      break;
    case "divider":
      html = `
        <div class="pages-component" data-id="${id}">
          <hr style="border: none; border-top: 1px solid #ddd; margin: 0;">
        </div>
      `;
      break;
    case "button":
      html = `
        <div class="pages-component" data-id="${id}">
          <div class="pages-component-header">Button</div>
          <button style="padding: 10px 20px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">Click me</button>
        </div>
      `;
      break;
    case "columns-2":
      html = `
        <div class="pages-component" data-id="${id}">
          <div class="pages-component-header">2-Column Layout</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="padding: 16px; background: #f9f9f9; border-radius: 4px; min-height: 80px;">Column 1</div>
            <div style="padding: 16px; background: #f9f9f9; border-radius: 4px; min-height: 80px;">Column 2</div>
          </div>
        </div>
      `;
      break;
    case "columns-3":
      html = `
        <div class="pages-component" data-id="${id}">
          <div class="pages-component-header">3-Column Layout</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <div style="padding: 16px; background: #f9f9f9; border-radius: 4px; min-height: 80px;">Column 1</div>
            <div style="padding: 16px; background: #f9f9f9; border-radius: 4px; min-height: 80px;">Column 2</div>
            <div style="padding: 16px; background: #f9f9f9; border-radius: 4px; min-height: 80px;">Column 3</div>
          </div>
        </div>
      `;
      break;
    default:
      html = `<div class="pages-component" data-id="${id}"><p>Component</p></div>`;
  }

  canvas.insertAdjacentHTML("beforeend", html);
  
  // Re-attach event listeners to new component
  const newComponent = canvas.querySelector(`[data-id="${id}"]`);
  if (newComponent) {
    attachComponentListeners(newComponent);
  }
}

function attachComponentListeners(component) {
  const content = component.querySelector(".pages-component-content");
  
  if (content && (content.tagName === "P" || content.tagName === "H2" || content.tagName === "H3")) {
    content.style.cursor = "pointer";
    content.addEventListener("click", function(e) {
      e.stopPropagation();
      const text = this.textContent;
      const input = document.createElement(content.tagName === "P" ? "textarea" : "input");
      input.type = "text";
      input.value = text;
      input.style.width = "100%";
      input.style.fontFamily = "inherit";
      input.style.fontSize = "inherit";
      input.style.padding = "4px 8px";
      input.style.border = "1px solid #17a2b8";
      input.style.borderRadius = "3px";
      
      if (content.tagName === "P") {
        input.style.minHeight = "60px";
        input.rows = 3;
      }
      
      const save = () => {
        content.textContent = input.value || "Empty";
        input.replaceWith(content);
        attachComponentListeners(component);
      };
      
      input.addEventListener("blur", save);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.ctrlKey) save();
        if (e.key === "Escape") {
          input.replaceWith(content);
          attachComponentListeners(component);
        }
      });
      
      this.replaceWith(input);
      input.focus();
      input.select();
    });
  }
}
