/**
 * ================================================================================
 * SIDEBAR MODULE - Unified Menu Component
 * ================================================================================
 * This module provides a standardized sidebar/menu system for all pages.
 * Source of truth: medicenter.html structure, icons, and behavior
 * 
 * Usage:
 *   const sidebar = window.initSidebar(config);
 *   sidebar.on('navigate', (section, item) => { ... });
 * 
 * ================================================================================
 */

(function() {
  'use strict';

  /**
   * Main Sidebar Manager Class
   * Handles all accordion operations, navigation, and state management
   */
  class SidebarManager {
    constructor(config = {}) {
      this.config = config;
      this.state = {
        openSection: null,
        expandedCollapsedSections: {}
      };
      this.listeners = {};
      this.collapsedGroups = [];
      this.collapsedSectionItems = this.config.collapsedItems || {};
    }

    /**
     * Initialize the sidebar with all accordions and navigation
     */
    init() {
      this.setupMainAccordions();
      this.setupCollapsedSections();
      this.restoreState();
    }

    /**
     * Setup main accordions (Media Center, Screening Room)
     */
    setupMainAccordions() {
      const headers = document.querySelectorAll('.acc-header[data-target]');
      
      headers.forEach((header) => {
        if (header.classList.contains('collapsed-only')) return;
        
        header.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleMainAccordion(header.dataset.target);
        });
      });
    }

    /**
     * Setup collapsed sections (Schedules, Mediabank, Website)
     */
    setupCollapsedSections() {
      const collapsedHeaders = document.querySelectorAll('.acc-header.collapsed-only');
      
      collapsedHeaders.forEach((header) => {
        const title = header.querySelector('.acc-title')?.textContent?.trim();
        if (!title || !this.collapsedSectionItems[title]) return;

        // Create items wrapper
        const itemsWrap = document.createElement('div');
        itemsWrap.className = 'acc-items';
        itemsWrap.style.maxHeight = '0';
        itemsWrap.style.overflow = 'hidden';
        itemsWrap.style.transition = 'max-height 0.3s ease';

        // Add items for this section
        this.collapsedSectionItems[title].forEach((label) => {
          const item = this.createNavItem(label, title);
          itemsWrap.appendChild(item);

          item.addEventListener('click', () => {
            this.handleItemClick(label, title);
          });
        });

        header.parentNode.insertBefore(itemsWrap, header.nextSibling);
        
        // Setup collapse/expand for this section
        header.style.cursor = 'pointer';
        itemsWrap.dataset.open = 'false';
        
        header.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleCollapsedSection(title, header, itemsWrap);
        });

        this.collapsedGroups.push({ title, header, itemsWrap });
      });
    }

    /**
     * Create a nav item element
     */
    createNavItem(label, section) {
      const item = document.createElement('div');
      item.className = 'nav-item sr-item';
      item.dataset.section = section.toLowerCase().replace(/\s+/g, '-');
      item.dataset.label = label;
      
      const icon = this.getIconForLabel(label);
      item.innerHTML = `
        ${icon}
        <span>${label}</span>
        <svg class="item-chevron" width="6" height="10" viewBox="0 0 6.8801 11.3654" fill="none">
          <path d="M0.280074 11.1326C-0.0930948 10.787 -0.0933998 10.1969 0.279411 9.85086L4.77015 5.68269L0.279431 1.5145C-0.093366 1.16847 -0.0930665 0.578438 0.280083 0.232795C0.615172 -0.0775938 1.13276 -0.0775987 1.46785 0.232783L6.55964 4.94905C6.98693 5.34482 6.98692 6.02056 6.55964 6.41633L1.46785 11.1326C1.13276 11.443 0.615169 11.443 0.280074 11.1326Z" fill="currentColor"/>
        </svg>
      `;
      return item;
    }

    /**
     * Get icon SVG for a given label
     */
    getIconForLabel(label) {
      const iconMap = this.config.icons || {};
      return iconMap[label] || '<svg class="nav-icon" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" fill="currentColor"/></svg>';
    }

    /**
     * Toggle a main accordion (Media Center, Screening Room)
     */
    toggleMainAccordion(target) {
      const section = document.getElementById('acc-' + target);
      if (!section) return;

      const isOpen = section.classList.contains('is-open');

      // Close all collapsed sections
      this.collapsedGroups.forEach((group) => {
        group.itemsWrap.style.maxHeight = '0';
        group.itemsWrap.dataset.open = 'false';
        const grpSection = group.header.closest('.accordion-section');
        if (grpSection) grpSection.classList.remove('is-open');
      });

      // Close other main accordions
      document.querySelectorAll('.accordion-section[id^="acc-"]').forEach((sec) => {
        if (sec.id !== 'acc-' + target) sec.classList.remove('is-open');
      });

      // Toggle the clicked section
      if (isOpen) {
        section.classList.remove('is-open');
        this.state.openSection = null;
      } else {
        section.classList.add('is-open');
        this.state.openSection = target;
      }

      this.saveState();
      this.emit('sectionToggle', target, !isOpen);
    }

    /**
     * Toggle a collapsed section (Schedules, Mediabank, Website)
     */
    toggleCollapsedSection(title, header, itemsWrap) {
      const isOpen = itemsWrap.dataset.open === 'true';

      // Close all other collapsed sections
      this.collapsedGroups.forEach((group) => {
        group.itemsWrap.style.maxHeight = '0';
        group.itemsWrap.dataset.open = 'false';
        const grpSection = group.header.closest('.accordion-section');
        if (grpSection) grpSection.classList.remove('is-open');
      });

      // Close all main accordions
      document.querySelectorAll('.accordion-section[id^="acc-"]').forEach((sec) => {
        sec.classList.remove('is-open');
      });

      // Toggle the clicked section
      if (!isOpen) {
        itemsWrap.style.maxHeight = '700px';
        itemsWrap.dataset.open = 'true';
        const section = header.closest('.accordion-section');
        if (section) section.classList.add('is-open');
        this.state.expandedCollapsedSections[title] = true;
      } else {
        this.state.expandedCollapsedSections[title] = false;
      }

      this.saveState();
      this.emit('sectionToggle', 'collapsed-' + title, !isOpen);
    }

    /**
     * Handle navigation when an item is clicked
     */
    handleItemClick(label, section) {
      // Special case: Pages item navigates to screeningroom
      if (label === 'Pages') {
        sessionStorage.setItem('showPagesOnLoad', 'true');
        window.location.href = 'screeningroom.html';
        return;
      }

      // Store navigation context
      sessionStorage.setItem('sr_target_section', section.toLowerCase().replace(/\s+/g, '-'));
      sessionStorage.setItem('sr_target_item', label);

      // Emit event for pages to listen
      this.emit('itemClick', { section, label });

      // Navigate to screening room
      window.location.href = 'screeningroom.html';
    }

    /**
     * Setup navigation for main accordion items (Posts, Pages, etc.)
     */
    setupMainItemNavigation() {
      document.querySelectorAll('.nav-item[data-section]').forEach((item) => {
        // Skip collapsed items (they have sr-item class)
        if (item.classList.contains('sr-item')) return;
        
        item.addEventListener('click', () => {
          const section = item.dataset.section;
          const label = item.textContent.trim();
          this.emit('itemClick', { section, label });
        });
      });
    }

    /**
     * Get current sidebar state
     */
    getState() {
      return { ...this.state };
    }

    /**
     * Set sidebar state
     */
    setState(newState) {
      this.state = { ...this.state, ...newState };
      this.saveState();
    }

    /**
     * Save state to sessionStorage
     */
    saveState() {
      sessionStorage.setItem('sidebar_state', JSON.stringify(this.state));
    }

    /**
     * Restore state from sessionStorage
     */
    restoreState() {
      const saved = sessionStorage.getItem('sidebar_state');
      if (saved) {
        try {
          this.state = JSON.parse(saved);
        } catch (e) {
          // Invalid JSON, ignore
        }
      }
    }

    /**
     * Event system: Register a listener
     */
    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }

    /**
     * Event system: Remove a listener
     */
    off(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    /**
     * Event system: Emit an event
     */
    emit(event, ...args) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach(callback => {
        try {
          callback(...args);
        } catch (e) {
          console.error(`Error in ${event} listener:`, e);
        }
      });
    }
  }

  /**
   * Global initialization function
   * Pages call this with their configuration
   */
  window.initSidebar = function(config = {}) {
    const sidebar = new SidebarManager(config);
    sidebar.init();
    return sidebar;
  };

  /**
   * Expose for testing/debugging
   */
  window.SidebarManager = SidebarManager;

})();
