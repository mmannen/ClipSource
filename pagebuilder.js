// Page Builder - Drag and Drop Page Construction
// ================================================

class PageBuilder {
  constructor() {
    this.components = [];
    this.draggedComponent = null;
    this.init();
  }

  init() {
    this.setupElements();
    this.attachEventListeners();
    this.loadPageData();
    this.render();
  }

  setupElements() {
    this.canvas = document.getElementById('pbCanvas');
    this.modal = document.getElementById('pbComponentModal');
    this.addComponentBtn = document.getElementById('pbAddComponentBtn');
    this.addComponentTrigger = document.querySelector('.pb-add-component-trigger');
    this.modalClose = document.querySelector('.pb-modal-close');
    this.componentItems = document.querySelectorAll('.pb-component-item');
  }

  attachEventListeners() {
    // Modal controls
    this.addComponentBtn?.addEventListener('click', () => this.openModal());
    this.addComponentTrigger?.addEventListener('click', () => this.openModal());
    this.modalClose?.addEventListener('click', () => this.closeModal());
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    this.componentItems.forEach(item => {
      item.addEventListener('click', () => this.addComponentType(item.dataset.component));
      item.addEventListener('dragstart', (e) => this.handleComponentDragStart(e, item.dataset.component));
    });

    // Canvas drag and drop
    this.canvas.addEventListener('dragover', (e) => this.handleCanvasDragOver(e));
    this.canvas.addEventListener('drop', (e) => this.handleCanvasDrop(e));
    this.canvas.addEventListener('dragleave', (e) => this.handleCanvasDragLeave(e));

    // Page title editing
    const pageTitle = document.querySelector('.pb-page-title');
    pageTitle?.addEventListener('blur', (e) => this.savePageData());

    // Step tabs
    document.querySelectorAll('.pb-step').forEach((tab, index) => {
      tab.addEventListener('click', () => this.switchStep(index));
    });

    // Preview and publish
    document.querySelector('.pb-preview-btn')?.addEventListener('click', () => this.preview());
    document.querySelector('.pb-publish-btn')?.addEventListener('click', () => this.publish());
  }

  // Modal Management
  openModal() {
    this.modal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal?.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Component Management
  addComponentType(type) {
    const component = this.createComponent(type);
    this.components.push(component);
    this.render();
    this.closeModal();
    this.savePageData();

    // Focus on new component if editable
    setTimeout(() => {
      const newElement = document.querySelector(`[data-component-id="${component.id}"]`);
      if (newElement && type !== 'divider' && type !== 'columns-2' && type !== 'columns-3') {
        const editable = newElement.querySelector('.pb-editable');
        editable?.click();
      }
    }, 100);
  }

  createComponent(type) {
    const id = Date.now().toString();
    const templates = {
      heading: {
        type: 'heading',
        id,
        content: 'Heading',
        level: 'h2',
      },
      text: {
        type: 'text',
        id,
        content: 'Add your text here...',
      },
      divider: {
        type: 'divider',
        id,
      },
      button: {
        type: 'button',
        id,
        content: 'Button',
        link: '#',
      },
      image: {
        type: 'image',
        id,
        src: '',
        alt: 'Image',
      },
      video: {
        type: 'video',
        id,
        src: '',
      },
      embed: {
        type: 'embed',
        id,
        code: '',
      },
      'columns-2': {
        type: 'columns',
        id,
        columns: 2,
        children: [
          { type: 'text', id: `${id}-col1`, content: 'Column 1' },
          { type: 'text', id: `${id}-col2`, content: 'Column 2' },
        ],
      },
      'columns-3': {
        type: 'columns',
        id,
        columns: 3,
        children: [
          { type: 'text', id: `${id}-col1`, content: 'Column 1' },
          { type: 'text', id: `${id}-col2`, content: 'Column 2' },
          { type: 'text', id: `${id}-col3`, content: 'Column 3' },
        ],
      },
      'latest-posts': {
        type: 'latest-posts',
        id,
        limit: 5,
      },
      highlights: {
        type: 'highlights',
        id,
      },
      filters: {
        type: 'filters',
        id,
      },
    };
    return templates[type] || templates.text;
  }

  deleteComponent(id) {
    this.components = this.components.filter(c => c.id !== id);
    this.render();
    this.savePageData();
  }

  duplicateComponent(id) {
    const component = this.components.find(c => c.id === id);
    if (component) {
      const duplicate = JSON.parse(JSON.stringify(component));
      duplicate.id = Date.now().toString();
      if (duplicate.children) {
        duplicate.children.forEach(child => {
          child.id = `${duplicate.id}-${Math.random()}`;
        });
      }
      const index = this.components.indexOf(component);
      this.components.splice(index + 1, 0, duplicate);
      this.render();
      this.savePageData();
    }
  }

  // Drag and Drop
  handleComponentDragStart(e, type) {
    this.draggedComponent = { type, fromModal: true };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('component-type', type);
  }

  handleCanvasDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.canvas.classList.add('drag-over');
  }

  handleCanvasDragLeave(e) {
    if (e.target === this.canvas) {
      this.canvas.classList.remove('drag-over');
    }
  }

  handleCanvasDrop(e) {
    e.preventDefault();
    this.canvas.classList.remove('drag-over');

    const componentType = e.dataTransfer.getData('component-type');
    if (componentType) {
      this.addComponentType(componentType);
    }
  }

  // Rendering
  render() {
    const emptyState = this.canvas.querySelector('.pb-empty-state');
    
    if (this.components.length === 0) {
      if (!emptyState) {
        this.canvas.innerHTML = `
          <div class="pb-empty-state">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="6" y="6" width="36" height="36" rx="2" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
              <line x1="6" y1="18" x2="42" y2="18" stroke="currentColor" stroke-width="1" opacity="0.2"/>
              <line x1="6" y1="30" x2="42" y2="30" stroke="currentColor" stroke-width="1" opacity="0.2"/>
            </svg>
            <p>Start building your page</p>
            <button class="pb-add-component-trigger">+ Add component</button>
          </div>
        `;
        document.querySelector('.pb-add-component-trigger')?.addEventListener('click', () => this.openModal());
      }
    } else {
      this.canvas.innerHTML = this.components.map(comp => this.renderComponent(comp)).join('');
      this.attachComponentEventListeners();
    }
  }

  renderComponent(component) {
    let content = '';

    switch (component.type) {
      case 'heading':
        content = `
          <div class="pb-canvas-component" data-component-id="${component.id}" draggable="true">
            <div class="pb-component-header">Heading</div>
            <h2 class="pb-editable" data-editable-id="${component.id}">${this.escapeHtml(component.content)}</h2>
            <div class="pb-component-actions">
              <button class="pb-component-action-btn duplicate" data-id="${component.id}" title="Duplicate">D</button>
              <button class="pb-component-action-btn delete" data-id="${component.id}" title="Delete">✕</button>
            </div>
          </div>
        `;
        break;

      case 'text':
        content = `
          <div class="pb-canvas-component" data-component-id="${component.id}" draggable="true">
            <div class="pb-component-header">Text</div>
            <p class="pb-editable" data-editable-id="${component.id}">${this.escapeHtml(component.content)}</p>
            <div class="pb-component-actions">
              <button class="pb-component-action-btn duplicate" data-id="${component.id}" title="Duplicate">D</button>
              <button class="pb-component-action-btn delete" data-id="${component.id}" title="Delete">✕</button>
            </div>
          </div>
        `;
        break;

      case 'divider':
        content = `
          <div class="pb-canvas-component" data-component-id="${component.id}" draggable="true">
            <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">
            <div class="pb-component-actions">
              <button class="pb-component-action-btn delete" data-id="${component.id}" title="Delete">✕</button>
            </div>
          </div>
        `;
        break;

      case 'button':
        content = `
          <div class="pb-canvas-component" data-component-id="${component.id}" draggable="true">
            <div class="pb-component-header">Button</div>
            <button style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">${this.escapeHtml(component.content)}</button>
            <div class="pb-component-actions">
              <button class="pb-component-action-btn duplicate" data-id="${component.id}" title="Duplicate">D</button>
              <button class="pb-component-action-btn delete" data-id="${component.id}" title="Delete">✕</button>
            </div>
          </div>
        `;
        break;

      case 'image':
        content = `
          <div class="pb-canvas-component" data-component-id="${component.id}" draggable="true">
            <div class="pb-component-header">Image</div>
            <div style="background: #f0f0f0; height: 200px; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: #999;">
              ${component.src ? `<img src="${component.src}" style="max-width: 100%; max-height: 100%;">` : 'Image placeholder'}
            </div>
            <div class="pb-component-actions">
              <button class="pb-component-action-btn duplicate" data-id="${component.id}" title="Duplicate">D</button>
              <button class="pb-component-action-btn delete" data-id="${component.id}" title="Delete">✕</button>
            </div>
          </div>
        `;
        break;

      case 'columns':
        const colWidth = 100 / component.columns;
        content = `
          <div class="pb-canvas-component" data-component-id="${component.id}" draggable="true">
            <div class="pb-component-header">${component.columns}-Column Layout</div>
            <div style="display: grid; grid-template-columns: repeat(${component.columns}, 1fr); gap: 12px;">
              ${component.children.map(child => `
                <div style="padding: 12px; background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 4px; min-height: 80px;">
                  <p class="pb-editable" data-editable-id="${child.id}">${this.escapeHtml(child.content)}</p>
                </div>
              `).join('')}
            </div>
            <div class="pb-component-actions">
              <button class="pb-component-action-btn duplicate" data-id="${component.id}" title="Duplicate">D</button>
              <button class="pb-component-action-btn delete" data-id="${component.id}" title="Delete">✕</button>
            </div>
          </div>
        `;
        break;

      case 'latest-posts':
        content = `
          <div class="pb-canvas-component" data-component-id="${component.id}" draggable="true">
            <div class="pb-component-header">Latest Posts</div>
            <div style="padding: 20px; background: #f9f9f9; border-radius: 4px; color: #999; text-align: center;">
              Latest ${component.limit} posts will appear here
            </div>
            <div class="pb-component-actions">
              <button class="pb-component-action-btn delete" data-id="${component.id}" title="Delete">✕</button>
            </div>
          </div>
        `;
        break;

      case 'highlights':
        content = `
          <div class="pb-canvas-component" data-component-id="${component.id}" draggable="true">
            <div class="pb-component-header">Highlights</div>
            <div style="padding: 20px; background: #f9f9f9; border-radius: 4px; color: #999; text-align: center;">
              Highlights will appear here
            </div>
            <div class="pb-component-actions">
              <button class="pb-component-action-btn delete" data-id="${component.id}" title="Delete">✕</button>
            </div>
          </div>
        `;
        break;

      case 'filters':
        content = `
          <div class="pb-canvas-component" data-component-id="${component.id}" draggable="true">
            <div class="pb-component-header">Filter Controls</div>
            <div style="padding: 12px; background: #f9f9f9; border-radius: 4px; display: flex; gap: 8px;">
              <input type="text" placeholder="Search..." style="padding: 6px 10px; border: 1px solid #ddd; border-radius: 3px; flex: 1;">
              <button style="padding: 6px 12px; background: #17a2b8; color: white; border: none; border-radius: 3px; cursor: pointer;">Filter</button>
            </div>
            <div class="pb-component-actions">
              <button class="pb-component-action-btn delete" data-id="${component.id}" title="Delete">✕</button>
            </div>
          </div>
        `;
        break;

      default:
        content = '';
    }

    return content;
  }

  attachComponentEventListeners() {
    // Drag components in canvas
    document.querySelectorAll('.pb-canvas-component').forEach(element => {
      element.addEventListener('dragstart', (e) => this.handleComponentInCanvasDragStart(e));
      element.addEventListener('dragend', (e) => this.handleComponentInCanvasDragEnd(e));
    });

    // Action buttons
    document.querySelectorAll('.pb-component-action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteComponent(btn.dataset.id));
    });

    document.querySelectorAll('.pb-component-action-btn.duplicate').forEach(btn => {
      btn.addEventListener('click', (e) => this.duplicateComponent(btn.dataset.id));
    });

    // Inline editing
    document.querySelectorAll('.pb-editable').forEach(element => {
      element.addEventListener('click', (e) => this.enableInlineEdit(e));
      element.addEventListener('blur', (e) => this.disableInlineEdit(e));
    });
  }

  handleComponentInCanvasDragStart(e) {
    const id = e.currentTarget.dataset.componentId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('component-id', id);
    e.currentTarget.classList.add('dragging');
  }

  handleComponentInCanvasDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
  }

  // Inline Editing
  enableInlineEdit(e) {
    const element = e.target;
    if (element.classList.contains('pb-editable') && !element.querySelector('input')) {
      const id = element.dataset.editableId;
      const text = element.textContent;

      let inputElement;
      if (element.tagName === 'H2') {
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.className = 'pb-editable-input';
        inputElement.value = text;
      } else {
        inputElement = document.createElement('textarea');
        inputElement.className = 'pb-editable-input';
        inputElement.value = text;
        inputElement.style.minHeight = '60px';
      }

      element.replaceWith(inputElement);
      inputElement.focus();
      inputElement.select();

      const saveEdit = () => {
        const newText = inputElement.value || 'Empty';
        this.updateComponentContent(id, newText);
        this.render();
        this.attachComponentEventListeners();
        this.savePageData();
      };

      inputElement.addEventListener('blur', saveEdit);
      inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) saveEdit();
        if (e.key === 'Escape') {
          this.render();
          this.attachComponentEventListeners();
        }
      });
    }
  }

  disableInlineEdit(e) {
    // Handled in saveEdit
  }

  updateComponentContent(id, content) {
    // Update in main component
    for (let comp of this.components) {
      if (comp.id === id) {
        comp.content = content;
        return;
      }
      // Update in children (for column layouts)
      if (comp.children) {
        for (let child of comp.children) {
          if (child.id === id) {
            child.content = content;
            return;
          }
        }
      }
    }
  }

  // Utilities
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Data Persistence
  savePageData() {
    const pageTitle = document.querySelector('.pb-page-title')?.value || 'Untitled Page';
    const data = {
      title: pageTitle,
      components: this.components,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('pageBuilderData', JSON.stringify(data));
  }

  loadPageData() {
    const saved = localStorage.getItem('pageBuilderData');
    if (saved) {
      const data = JSON.parse(saved);
      this.components = data.components || [];
      const pageTitle = document.querySelector('.pb-page-title');
      if (pageTitle) pageTitle.value = data.title || 'Untitled Page';
    }
  }

  // Step Navigation
  switchStep(index) {
    document.querySelectorAll('.pb-step').forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });
  }

  // Preview and Publish
  preview() {
    alert('Preview feature coming soon!');
  }

  publish() {
    this.savePageData();
    alert('Page published! Check console for page data.');
    console.log('Published page:', {
      title: document.querySelector('.pb-page-title').value,
      components: this.components,
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new PageBuilder();
});
