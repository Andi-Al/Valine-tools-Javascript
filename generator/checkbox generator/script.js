// ========================================
// Tool Init Helper
// ========================================
function initTool(toolInfo) {
    if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`;
}

// ========================================
// Debounce & Throttle
// ========================================
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) { func.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); }
    };
}

// ========================================
// String Utilities
// ========================================
function slugify(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
}

// ========================================
// DOM Helpers
// ========================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') el.className = value;
        else if (key === 'textContent') el.textContent = value;
        else if (key === 'innerHTML') el.innerHTML = value;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
        else el.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else if (child instanceof Node) el.appendChild(child);
    });
    return el;
}

// ========================================
// Storage Helpers (localStorage)
// ========================================
const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch { return defaultValue; }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch { return false; }
    },
    remove(key) { localStorage.removeItem(key); },
    clear() { localStorage.clear(); }
};

// ========================================
// Copy to Clipboard
// ========================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
        return true;
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
        return true;
    }
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, duration = 2000) {
    let toast = $('#toast-notification');
    if (!toast) {
        toast = createElement('div', {
            id: 'toast-notification',
            style: 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(100px);background:#1f2937;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.875rem;z-index:9999;transition:transform 0.3s ease;box-shadow:0 4px 6px rgba(0,0,0,0.1);'
        });
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, duration);
}

// ========================================
// Escape HTML for code display
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Checkbox Generator Logic
// ========================================
let itemCounter = 3;

function getItems() {
    const rows = $$('.item-row');
    const items = [];
    rows.forEach((row, index) => {
        const label = row.querySelector('.item-label').value.trim() || `Option ${index + 1}`;
        const value = row.querySelector('.item-value').value.trim() || slugify(label);
        const checked = row.querySelector('.item-checked').checked;
        const disabled = row.querySelector('.item-disabled').checked;
        items.push({ label, value, checked, disabled });
    });
    return items;
}

function generateHtmlCode(items, groupName, style, layout, gridColumns, themeColor, customIcon) {
    let html = '<div class="checkbox-group"';
    if (layout === 'horizontal') html += ' data-layout="horizontal"';
    else if (layout === 'grid') html += ` data-layout="grid" data-columns="${gridColumns}"`;
    html += '>\n';

    items.forEach((item, index) => {
        const id = `${slugify(groupName)}-${index}`;
        html += `  <div class="checkbox-item${style !== 'default' ? ` checkbox-${style}` : ''}">`;
        html += `\n    <input type="checkbox"`;
        html += ` name="${groupName}"`;
        html += ` value="${item.value}"`;
        html += ` id="${id}"`;
        if (item.checked) html += ` checked`;
        if (item.disabled) html += ` disabled`;
        html += `>`;
        html += `\n    <label for="${id}">${item.label}</label>`;
        html += `\n  </div>\n`;
    });

    html += '</div>';
    return html;
}

function generateCssCode(style, layout, gridColumns, themeColor) {
    let css = `/* Checkbox Styles */\n`;
    css += `.checkbox-group {\n`;
    if (layout === 'vertical') css += `  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n`;
    else if (layout === 'horizontal') css += `  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n`;
    else if (layout === 'grid') css += `  display: grid;\n  grid-template-columns: repeat(${gridColumns}, 1fr);\n  gap: 0.75rem;\n`;
    css += `}\n\n`;

    css += `.checkbox-item {\n`;
    css += `  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n`;
    css += `}\n\n`;

    if (style === 'toggle') {
        css += `/* Toggle Switch Style */\n`;
        css += `.checkbox-toggle input[type="checkbox"] {\n`;
        css += `  display: none;\n`;
        css += `}\n\n`;
        css += `.checkbox-toggle label {\n`;
        css += `  position: relative;\n`;
        css += `  padding-left: 3.5rem;\n`;
        css += `  cursor: pointer;\n`;
        css += `  user-select: none;\n`;
        css += `}\n\n`;
        css += `.checkbox-toggle label::before {\n`;
        css += `  content: '';\n`;
        css += `  position: absolute;\n`;
        css += `  left: 0;\n`;
        css += `  top: 50%;\n`;
        css += `  transform: translateY(-50%);\n`;
        css += `  width: 2.75rem;\n`;
        css += `  height: 1.5rem;\n`;
        css += `  background: #d1d5db;\n`;
        css += `  border-radius: 1rem;\n`;
        css += `  transition: background 0.3s;\n`;
        css += `}\n\n`;
        css += `.checkbox-toggle label::after {\n`;
        css += `  content: '';\n`;
        css += `  position: absolute;\n`;
        css += `  left: 0.25rem;\n`;
        css += `  top: 50%;\n`;
        css += `  transform: translateY(-50%);\n`;
        css += `  width: 1.25rem;\n`;
        css += `  height: 1.25rem;\n`;
        css += `  background: white;\n`;
        css += `  border-radius: 50%;\n`;
        css += `  transition: left 0.3s;\n`;
        css += `  box-shadow: 0 1px 3px rgba(0,0,0,0.2);\n`;
        css += `}\n\n`;
        css += `.checkbox-toggle input[type="checkbox"]:checked + label::before {\n`;
        css += `  background: ${themeColor};\n`;
        css += `}\n\n`;
        css += `.checkbox-toggle input[type="checkbox"]:checked + label::after {\n`;
        css += `  left: 1.25rem;\n`;
        css += `}\n\n`;
        css += `.checkbox-toggle input[type="checkbox"]:disabled + label {\n`;
        css += `  opacity: 0.5;\n`;
        css += `  cursor: not-allowed;\n`;
        css += `}\n\n`;
    } else if (style === 'card') {
        css += `/* Card Select Style */\n`;
        css += `.checkbox-card input[type="checkbox"] {\n`;
        css += `  display: none;\n`;
        css += `}\n\n`;
        css += `.checkbox-card label {\n`;
        css += `  display: block;\n`;
        css += `  padding: 1rem;\n`;
        css += `  border: 2px solid #e5e7eb;\n`;
        css += `  border-radius: 0.5rem;\n`;
        css += `  cursor: pointer;\n`;
        css += `  transition: all 0.2s;\n`;
        css += `  text-align: center;\n`;
        css += `}\n\n`;
        css += `.checkbox-card label:hover {\n`;
        css += `  border-color: ${themeColor};\n`;
        css += `  background: #f9fafb;\n`;
        css += `}\n\n`;
        css += `.checkbox-card input[type="checkbox"]:checked + label {\n`;
        css += `  border-color: ${themeColor};\n`;
        css += `  background: ${themeColor}15;\n`;
        css += `  box-shadow: 0 0 0 1px ${themeColor};\n`;
        css += `}\n\n`;
        css += `.checkbox-card input[type="checkbox"]:disabled + label {\n`;
        css += `  opacity: 0.5;\n`;
        css += `  cursor: not-allowed;\n`;
        css += `}\n\n`;
    } else if (style === 'custom-icon') {
        css += `/* Custom Icon Style */\n`;
        css += `.checkbox-custom-icon input[type="checkbox"] {\n`;
        css += `  display: none;\n`;
        css += `}\n\n`;
        css += `.checkbox-custom-icon label {\n`;
        css += `  display: flex;\n`;
        css += `  align-items: center;\n`;
        css += `  gap: 0.5rem;\n`;
        css += `  cursor: pointer;\n`;
        css += `  user-select: none;\n`;
        css += `}\n\n`;
        css += `.checkbox-custom-icon label::before {\n`;
        css += `  content: '☐';\n`;
        css += `  font-size: 1.25rem;\n`;
        css += `  transition: all 0.2s;\n`;
        css += `}\n\n`;
        css += `.checkbox-custom-icon input[type="checkbox"]:checked + label::before {\n`;
        css += `  content: '✓';\n`;
        css += `  color: ${themeColor};\n`;
        css += `}\n\n`;
        css += `.checkbox-custom-icon input[type="checkbox"]:disabled + label {\n`;
        css += `  opacity: 0.5;\n`;
        css += `  cursor: not-allowed;\n`;
        css += `}\n\n`;
    } else {
        css += `/* Default Style */\n`;
        css += `.checkbox-item input[type="checkbox"] {\n`;
        css += `  width: 1.25rem;\n`;
        css += `  height: 1.25rem;\n`;
        css += `  cursor: pointer;\n`;
        css += `  accent-color: ${themeColor};\n`;
        css += `}\n\n`;
        css += `.checkbox-item label {\n`;
        css += `  cursor: pointer;\n`;
        css += `}\n\n`;
        css += `.checkbox-item input[type="checkbox"]:disabled + label {\n`;
        css += `  opacity: 0.5;\n`;
        css += `  cursor: not-allowed;\n`;
        css += `}\n\n`;
    }

    return css;
}

function generateJsCode(groupName, maxSelectable, selectAllOption) {
    let js = `// Checkbox Logic\n`;
    js += `document.addEventListener('DOMContentLoaded', () => {\n`;
    js += `  const checkboxes = document.querySelectorAll('input[name="${groupName}"]');\n`;

    if (maxSelectable > 0) {
        js += `\n  // Max selectable: ${maxSelectable}\n`;
        js += `  const maxSelectable = ${maxSelectable};\n\n`;
        js += `  checkboxes.forEach(cb => {\n`;
        js += `    cb.addEventListener('change', () => {\n`;
        js += `      const checkedCount = document.querySelectorAll('input[name="${groupName}"]:checked').length;\n`;
        js += `      if (checkedCount >= maxSelectable) {\n`;
        js += `        checkboxes.forEach(cb => {\n`;
        js += `          if (!cb.checked) cb.disabled = true;\n`;
        js += `        });\n`;
        js += `      } else {\n`;
        js += `        checkboxes.forEach(cb => cb.disabled = false);\n`;
        js += `      }\n`;
        js += `    });\n`;
        js += `  });\n`;
    }

    if (selectAllOption) {
        js += `\n  // Select All functionality\n`;
        js += `  const selectAllBtn = document.getElementById('select-all-btn');\n`;
        js += `  if (selectAllBtn) {\n`;
        js += `    selectAllBtn.addEventListener('click', () => {\n`;
        js += `      const allChecked = Array.from(checkboxes).every(cb => cb.checked);\n`;
        js += `      checkboxes.forEach(cb => {\n`;
        js += `        if (!cb.disabled) cb.checked = !allChecked;\n`;
        js += `      });\n`;
        js += `      selectAllBtn.textContent = allChecked ? 'Deselect All' : 'Select All';\n`;
        js += `    });\n`;
        js += `  }\n`;
    }

    js += `});\n`;
    return js;
}

function generateFullCode(items, groupName, style, layout, gridColumns, themeColor, customIcon, maxSelectable, selectAllOption) {
    const html = generateHtmlCode(items, groupName, style, layout, gridColumns, themeColor, customIcon);
    const css = generateCssCode(style, layout, gridColumns, themeColor);
    const js = generateJsCode(groupName, maxSelectable, selectAllOption);

    let full = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Checkbox Group</title>\n  <style>\n`;
    full += css;
    full += `  </style>\n</head>\n<body>\n`;

    if (selectAllOption) {
        full += `  <button id="select-all-btn" style="margin-bottom: 1rem; padding: 0.5rem 1rem; cursor: pointer;">Select All</button>\n`;
    }

    full += html;
    full += `\n\n  <script>\n`;
    full += js;
    full += `  </script>\n</body>\n</html>`;

    return full;
}

function renderPreview(items, groupName, style, layout, gridColumns, themeColor, customIcon, maxSelectable, selectAllOption) {
    const container = $('#preview-container');
    container.innerHTML = '';

    // Remove old dynamic style tag
    const oldStyle = $('#preview-dynamic-style');
    if (oldStyle) oldStyle.remove();

    // Create dynamic style for toggle switch (pseudo-elements can't be styled inline)
    const dynamicStyle = createElement('style', { id: 'preview-dynamic-style' });
    dynamicStyle.textContent = generatePreviewCss(style, themeColor);
    document.head.appendChild(dynamicStyle);

    const wrapper = createElement('div', { className: `checkbox-group${style !== 'default' ? ` preview-${style}` : ''}` });
    if (layout === 'horizontal') wrapper.dataset.layout = 'horizontal';
    else if (layout === 'grid') {
        wrapper.dataset.layout = 'grid';
        wrapper.dataset.columns = gridColumns;
    }

    // Apply layout CSS inline
    if (layout === 'grid') {
        wrapper.style.display = 'grid';
        wrapper.style.gridTemplateColumns = `repeat(${gridColumns}, 1fr)`;
        wrapper.style.gap = '0.75rem';
    } else if (layout === 'horizontal') {
        wrapper.style.display = 'flex';
        wrapper.style.flexWrap = 'wrap';
        wrapper.style.gap = '1rem';
    } else {
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '0.5rem';
    }

    if (selectAllOption) {
        const btn = createElement('button', {
            id: 'select-all-btn',
            className: 'btn btn-secondary btn-sm',
            textContent: 'Select All',
            style: 'margin-bottom: 0.75rem; width: fit-content;'
        });
        container.appendChild(btn);
    }

    const slugName = slugify(groupName);

    items.forEach((item, index) => {
        const id = `${slugName}-${index}`;
        const itemDiv = createElement('div', {
            className: `checkbox-item${style !== 'default' ? ` checkbox-${style}` : ''}`
        });

        const input = createElement('input', {
            type: 'checkbox',
            name: groupName,
            value: item.value,
            id: id
        });
        if (item.checked) input.checked = true;
        if (item.disabled) input.disabled = true;

        const label = createElement('label', {
            for: id,
            textContent: item.label
        });

        // Apply custom icon
        if (style === 'custom-icon') {
            input.style.display = 'none';
            const iconSpan = createElement('span', {
                className: 'custom-icon',
                textContent: item.checked ? (customIcon || '✓') : '☐',
                style: `color: ${item.checked ? themeColor : 'inherit'}; font-size: 1.25rem; transition: all 0.2s;`
            });

            input.addEventListener('change', () => {
                iconSpan.style.color = input.checked ? themeColor : 'inherit';
                iconSpan.textContent = input.checked ? (customIcon || '✓') : '☐';
                updateMaxSelectable(container, maxSelectable, groupName);
            });

            itemDiv.appendChild(input);
            itemDiv.appendChild(iconSpan);
            itemDiv.appendChild(label);
        } else if (style === 'card') {
            input.style.display = 'none';
            if (item.checked) {
                label.style.borderColor = themeColor;
                label.style.background = `${themeColor}15`;
                label.style.boxShadow = `0 0 0 1px ${themeColor}`;
            }

            input.addEventListener('change', () => {
                if (input.checked) {
                    label.style.borderColor = themeColor;
                    label.style.background = `${themeColor}15`;
                    label.style.boxShadow = `0 0 0 1px ${themeColor}`;
                } else {
                    label.style.borderColor = '#e5e7eb';
                    label.style.background = 'white';
                    label.style.boxShadow = 'none';
                }
                updateMaxSelectable(container, maxSelectable, groupName);
            });

            itemDiv.appendChild(input);
            itemDiv.appendChild(label);
        } else if (style === 'toggle') {
            // Toggle switch uses CSS pseudo-elements via dynamic style tag
            input.addEventListener('change', () => {
                updateMaxSelectable(container, maxSelectable, groupName);
            });
            itemDiv.appendChild(input);
            itemDiv.appendChild(label);
        } else {
            input.style.accentColor = themeColor;
            input.addEventListener('change', () => {
                updateMaxSelectable(container, maxSelectable, groupName);
            });
            itemDiv.appendChild(input);
            itemDiv.appendChild(label);
        }

        wrapper.appendChild(itemDiv);
    });

    container.appendChild(wrapper);

    // Select All logic
    if (selectAllOption) {
        const selectAllBtn = container.querySelector('#select-all-btn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                const allCheckboxes = container.querySelectorAll(`input[name="${groupName}"]`);
                const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
                allCheckboxes.forEach(cb => {
                    if (!cb.disabled) cb.checked = !allChecked;
                    cb.dispatchEvent(new Event('change'));
                });
                selectAllBtn.textContent = allChecked ? 'Deselect All' : 'Select All';
            });
        }
    }

    // Apply initial max selectable state
    if (maxSelectable > 0) {
        updateMaxSelectable(container, maxSelectable, groupName);
    }
}

function generatePreviewCss(style, themeColor) {
    let css = '';
    if (style === 'toggle') {
        css += `.preview-toggle input[type="checkbox"] { display: none; }\n`;
        css += `.preview-toggle label { position: relative; padding-left: 3.5rem; cursor: pointer; user-select: none; display: block; padding-top: 0.35rem; padding-bottom: 0.35rem; }\n`;
        css += `.preview-toggle label::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 2.75rem; height: 1.5rem; background: #d1d5db; border-radius: 1rem; transition: background 0.3s; }\n`;
        css += `.preview-toggle label::after { content: ''; position: absolute; left: 0.25rem; top: 50%; transform: translateY(-50%); width: 1.25rem; height: 1.25rem; background: white; border-radius: 50%; transition: left 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }\n`;
        css += `.preview-toggle input[type="checkbox"]:checked + label::before { background: ${themeColor}; }\n`;
        css += `.preview-toggle input[type="checkbox"]:checked + label::after { left: 1.25rem; }\n`;
        css += `.preview-toggle input[type="checkbox"]:disabled + label { opacity: 0.5; cursor: not-allowed; }\n`;
    } else if (style === 'custom-icon') {
        css += `.preview-custom-icon input[type="checkbox"] { display: none; }\n`;
        css += `.preview-custom-icon .custom-icon { font-size: 1.25rem; transition: all 0.2s; }\n`;
        css += `.preview-custom-icon input[type="checkbox"]:disabled + label { opacity: 0.5; cursor: not-allowed; }\n`;
    }
    return css;
}

function getInlineItemStyle() {
    return '';
}

function updateMaxSelectable(container, maxSelectable, groupName) {
    if (maxSelectable <= 0) return;
    const checkboxes = container.querySelectorAll(`input[name="${groupName}"]`);
    const checkedCount = container.querySelectorAll(`input[name="${groupName}"]:checked`).length;

    checkboxes.forEach(cb => {
        if (!cb.disabled || checkedCount < maxSelectable) {
            cb.disabled = cb.dataset.originallyDisabled === 'true';
        }
        if (checkedCount >= maxSelectable && !cb.checked) {
            cb.disabled = true;
        }
    });
}

function generate() {
    const items = getItems();
    const groupName = $('#group-name').value.trim() || 'myCheckbox';
    const style = $('#checkbox-style').value;
    const layout = $('#checkbox-layout').value;
    const gridColumns = parseInt($('#grid-columns').value) || 3;
    const themeColor = $('#checkbox-theme').value;
    const customIcon = $('#custom-icon').value.trim() || '✓';
    const maxSelectable = parseInt($('#max-selectable').value) || 0;
    const selectAllOption = $('#select-all-option').checked;

    // Generate code
    const htmlCode = generateHtmlCode(items, groupName, style, layout, gridColumns, themeColor, customIcon);
    const cssCode = generateCssCode(style, layout, gridColumns, themeColor);
    const jsCode = generateJsCode(groupName, maxSelectable, selectAllOption);
    const fullCode = generateFullCode(items, groupName, style, layout, gridColumns, themeColor, customIcon, maxSelectable, selectAllOption);

    // Display code in tabs
    $('#output-html').textContent = htmlCode;
    $('#output-css').textContent = cssCode;
    $('#output-js').textContent = jsCode;
    $('#output-full').textContent = fullCode;

    // Render preview
    renderPreview(items, groupName, style, layout, gridColumns, themeColor, customIcon, maxSelectable, selectAllOption);

    showToast('Code generated!');
}

// ========================================
// Event Listeners
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Checkbox Generator', icon: '☑️' });

    // Generate button
    $('#generate-btn').addEventListener('click', generate);

    // Add item button
    $('#add-item-btn').addEventListener('click', () => {
        itemCounter++;
        const row = createElement('div', {
            className: 'item-row',
            'data-index': itemCounter
        });
        row.innerHTML = `
            <input type="text" class="form-input item-label" placeholder="Label text" value="Option ${itemCounter}">
            <input type="text" class="form-input item-value" placeholder="Value (optional)">
            <label class="checkbox-inline">
                <input type="checkbox" class="item-checked"> Checked
            </label>
            <label class="checkbox-inline">
                <input type="checkbox" class="item-disabled"> Disabled
            </label>
            <button class="btn-remove-item" title="Remove item">&times;</button>
        `;
        $('#items-container').appendChild(row);

        // Add remove listener
        row.querySelector('.btn-remove-item').addEventListener('click', () => {
            if ($$('.item-row').length > 1) {
                row.remove();
            } else {
                showToast('Minimum 1 item required');
            }
        });
    });

    // Remove item listeners
    $$('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            if ($$('.item-row').length > 1) {
                btn.closest('.item-row').remove();
            } else {
                showToast('Minimum 1 item required');
            }
        });
    });

    // Tab switching
    $$('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.tab-btn').forEach(b => b.classList.remove('active'));
            $$('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            $(`#output-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // Copy code button
    $('#copy-code-btn').addEventListener('click', () => {
        const activeTab = $('.tab-btn.active').dataset.tab;
        const code = $(`#output-${activeTab}`).textContent;
        if (code) {
            copyToClipboard(code);
        }
    });

    // Toggle grid columns visibility
    const layoutSelect = $('#checkbox-layout');
    const gridGroup = $('#grid-columns-group');
    layoutSelect.addEventListener('change', () => {
        gridGroup.classList.toggle('hidden', layoutSelect.value !== 'grid');
    });

    // Toggle custom icon visibility
    const styleSelect = $('#checkbox-style');
    const customIconGroup = $('#custom-icon-group');
    styleSelect.addEventListener('change', () => {
        customIconGroup.classList.toggle('hidden', styleSelect.value !== 'custom-icon');
    });

    // Auto-generate on input change (debounced)
    const debouncedGenerate = debounce(generate, 300);
    $$('#tool-content input, #tool-content select, #tool-content textarea').forEach(el => {
        el.addEventListener('input', debouncedGenerate);
        el.addEventListener('change', debouncedGenerate);
    });

    // Initial generate
    generate();
});
