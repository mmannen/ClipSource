(function () {
  const STORAGE_KEY = 'clipsource_accessibility_settings';

  const DEFAULT_SETTINGS = {
    textSize: 'default',
    contrast: 'off',
  };

  function readSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (_error) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function applySettings(settings) {
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
    // Use body as base for all em calculations to ensure consistency
    style.textContent = `
      body {
        font-size: 16px;
      }
      
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

  function boot() {
    const settings = readSettings();
    applySettings(settings);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
