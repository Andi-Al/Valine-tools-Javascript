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
// Caesar Cipher Logic
// ========================================
const ENGLISH_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const EXTENDED_ASCII_SIZE = 256;

function caesarEncrypt(text, shift, preserveCase, preserveNonAlpha, alphabetType) {
    if (alphabetType === 'extended') {
        return extendedCaesar(text, shift, 'encrypt');
    }

    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (/[a-zA-Z]/.test(char)) {
            const isUpper = char === char.toUpperCase();
            const base = isUpper ? 'A' : 'a';
            const charCode = char.charCodeAt(0);
            const baseCode = base.charCodeAt(0);
            let newIndex = (charCode - baseCode + shift) % 26;
            if (newIndex < 0) newIndex += 26;
            const newChar = String.fromCharCode(baseCode + newIndex);
            result += preserveCase ? newChar : newChar.toLowerCase();
        } else if (preserveNonAlpha) {
            result += char;
        } else {
            result += char;
        }
    }
    return result;
}

function caesarDecrypt(text, shift, preserveCase, preserveNonAlpha, alphabetType) {
    if (alphabetType === 'extended') {
        return extendedCaesar(text, shift, 'decrypt');
    }

    return caesarEncrypt(text, -shift, preserveCase, preserveNonAlpha, alphabetType);
}

function extendedCaesar(text, shift, mode) {
    let result = '';
    const actualShift = mode === 'decrypt' ? (EXTENDED_ASCII_SIZE - shift) : shift;

    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const newCode = (charCode + actualShift) % EXTENDED_ASCII_SIZE;
        result += String.fromCharCode(newCode);
    }
    return result;
}

function bruteForceDecrypt(text, alphabetType) {
    const results = [];
    for (let shift = 1; shift <= 25; shift++) {
        const decrypted = caesarDecrypt(text, shift, true, true, alphabetType);
        results.push({ shift, text: decrypted });
    }
    return results;
}

function process() {
    const inputText = $('#input-text').value;
    const shift = parseInt($('#shift-value').value) || 3;
    const mode = $('input[name="mode"]:checked').value;
    const preserveCase = $('#preserve-case').checked;
    const preserveNonAlpha = $('#preserve-non-alpha').checked;
    const alphabetType = $('#alphabet').value;

    if (!inputText.trim()) {
        showToast('Please enter some text');
        return;
    }

    if (shift < 1 || shift > 25) {
        showToast('Shift must be between 1 and 25');
        return;
    }

    let result;
    if (mode === 'encrypt') {
        result = caesarEncrypt(inputText, shift, preserveCase, preserveNonAlpha, alphabetType);
    } else {
        result = caesarDecrypt(inputText, shift, preserveCase, preserveNonAlpha, alphabetType);
    }

    // Display result
    const outputEl = $('#output-text');
    outputEl.textContent = result;

    // Brute force analysis (always decrypt with all shifts)
    const bruteForceContainer = $('#brute-force-table');
    bruteForceContainer.innerHTML = '';

    const bruteResults = bruteForceDecrypt(result, alphabetType);
    bruteResults.forEach(({ shift: s, text: t }) => {
        const row = createElement('div', { className: 'brute-row' });
        const shiftLabel = createElement('span', {
            className: 'brute-shift',
            textContent: `Shift -${s}:`
        });
        const textSpan = createElement('span', {
            className: 'brute-text',
            textContent: t
        });
        const copyBtn = createElement('button', {
            className: 'btn-copy-brute',
            textContent: '📋',
            onClick: () => copyToClipboard(t)
        });

        // Highlight the correct shift
        if (s === shift) {
            row.classList.add('brute-highlight');
        }

        row.appendChild(shiftLabel);
        row.appendChild(textSpan);
        row.appendChild(copyBtn);
        bruteForceContainer.appendChild(row);
    });

    showToast(`${mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} successfully!`);
}

// ========================================
// Event Listeners
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Caesar Cipher', icon: '🔐' });

    // Process button
    $('#process-btn').addEventListener('click', process);

    // Copy button
    $('#copy-btn').addEventListener('click', () => {
        const text = $('#output-text').textContent;
        if (text && text !== '-') {
            copyToClipboard(text);
        }
    });

    // Swap button
    $('#swap-btn').addEventListener('click', () => {
        const inputEl = $('#input-text');
        const outputEl = $('#output-text');
        const temp = inputEl.value;
        inputEl.value = outputEl.textContent;
        outputEl.textContent = temp;
    });

    // Auto-process on input change (debounced)
    const debouncedProcess = debounce(process, 300);
    $$('#tool-content input, #tool-content select, #tool-content textarea').forEach(el => {
        el.addEventListener('input', debouncedProcess);
        el.addEventListener('change', debouncedProcess);
    });
});
