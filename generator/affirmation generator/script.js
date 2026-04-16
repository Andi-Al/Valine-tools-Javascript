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
// Number Formatting
// ========================================
function formatNumber(num, decimals = 2) {
    if (isNaN(num) || num === null) return '0';
    return Number(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatPercent(value, decimals = 2) {
    return formatNumber(value * 100, decimals) + '%';
}

// ========================================
// Math Utilities
// ========================================
function percentage(part, whole) { return (part / whole) * 100; }
function percentageOf(percent, whole) { return (percent / 100) * whole; }
function percentageChange(oldValue, newValue) { return ((newValue - oldValue) / Math.abs(oldValue)) * 100; }
function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function lerp(start, end, t) { return start + (end - start) * t; }
function mapRange(value, inMin, inMax, outMin, outMax) { return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin; }

// ========================================
// String Utilities
// ========================================
function slugify(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function titleCase(str) { return str.toLowerCase().replace(/\b\w/g, capitalize); }
function camelCase(str) { return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase()); }
function snakeCase(str) { return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.join('_').toLowerCase() || str.toLowerCase(); }
function kebabCase(str) { return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.join('-').toLowerCase() || str.toLowerCase(); }

// ========================================
// Date Utilities
// ========================================
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    return format.replace('YYYY', d.getFullYear()).replace('MM', String(d.getMonth() + 1).padStart(2, '0')).replace('DD', String(d.getDate()).padStart(2, '0')).replace('HH', String(d.getHours()).padStart(2, '0')).replace('mm', String(d.getMinutes()).padStart(2, '0')).replace('ss', String(d.getSeconds()).padStart(2, '0'));
}
function daysBetween(date1, date2) { const oneDay = 24 * 60 * 60 * 1000; return Math.round(Math.abs((date1 - date2) / oneDay)); }
function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }

// ========================================
// Color Utilities
// ========================================
const Color = {
    rgbToHex(r, g, b) { return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''); },
    hexToRgb(hex) { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null; },
    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    },
    hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1; if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },
    random() { return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'); }
};

// ========================================
// Random Utilities
// ========================================
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max, decimals = 2) { return Number((Math.random() * (max - min) + min).toFixed(decimals)); }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomString(length = 10, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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
// Validation
// ========================================
function isEmail(str) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str); }
function isURL(str) { try { new URL(str); return true; } catch { return false; } }
function isNumber(str) { return !isNaN(str) && !isNaN(parseFloat(str)); }

// ========================================
// Tool Init Helper
// ========================================
function initTool(toolInfo) {
    if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`;
}

// ========================================
// TOOL LOGIC BELOW
// ========================================

/**
 * Affirmation Generator
 * Generate positive affirmations
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Affirmation Generator', icon: '💪' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const affirmations = {
        self: [
            "I am worthy of love, happiness, and all the good things life has to offer.",
            "I am enough exactly as I am, and I am constantly growing.",
            "I trust myself to make the right decisions for my life.",
            "I am proud of how far I have come and excited for where I am going.",
            "I deserve to take up space and express my authentic self.",
            "I am resilient, strong, and capable of overcoming any challenge.",
            "I love and accept myself unconditionally, flaws and all.",
            "I am the architect of my own happiness.",
            "I choose to focus on what I can control and release what I cannot.",
            "I am a unique individual with valuable contributions to make."
        ],
        confidence: [
            "I believe in my abilities and trust my judgment.",
            "I walk into every room with confidence and purpose.",
            "My voice matters and I speak with conviction.",
            "I am confident in who I am and what I bring to the world.",
            "Every day I grow more confident in my abilities.",
            "I radiate confidence, self-respect, and inner strength.",
            "I do not need validation from others—I validate myself.",
            "I am bold, courageous, and ready to take on new challenges.",
            "My confidence comes from within and cannot be shaken.",
            "I trust myself to handle whatever comes my way."
        ],
        success: [
            "I am capable of achieving anything I set my mind to.",
            "Success flows to me naturally and effortlessly.",
            "I attract opportunities that lead to growth and prosperity.",
            "Every step I take brings me closer to my goals.",
            "I am a magnet for success, abundance, and positive outcomes.",
            "My potential is limitless and my determination is unshakable.",
            "I deserve success and I welcome it into my life.",
            "I turn every obstacle into an opportunity for growth.",
            "My hard work and dedication are paying off in remarkable ways.",
            "I am building a future that I am truly proud of."
        ],
        health: [
            "My body is healthy, strong, and full of energy.",
            "I nourish my body with wholesome foods and positive thoughts.",
            "Every cell in my body vibrates with health and vitality.",
            "I listen to my body and give it what it needs.",
            "I am grateful for my body and all that it does for me.",
            "My mind and body are in perfect harmony.",
            "I choose activities that strengthen and heal my body.",
            "I deserve to feel vibrant, energetic, and alive.",
            "My immune system is powerful and keeps me protected.",
            "I radiate health, wellness, and positive energy."
        ],
        relationships: [
            "I attract people who are positive, supportive, and loving.",
            "I am worthy of deep, meaningful, and lasting connections.",
            "I communicate openly and honestly with those I care about.",
            "My relationships are built on trust, respect, and love.",
            "I am a loving friend, partner, and family member.",
            "I set healthy boundaries that protect my peace.",
            "I forgive others and release any resentment I hold.",
            "I surround myself with people who uplift and inspire me.",
            "I am open to receiving love in all its forms.",
            "Every relationship in my life helps me grow and learn."
        ],
        general: [
            "Today is a brand new opportunity, and I embrace it fully.",
            "I choose to be happy right now, not someday in the future.",
            "I am grateful for the gift of this beautiful day.",
            "I release all negativity and welcome peace into my mind.",
            "I am constantly evolving into the best version of myself.",
            "Life is beautiful, and I am blessed beyond measure.",
            "I choose positive thoughts that empower and uplift me.",
            "I am at peace with my past and excited about my future.",
            "Everything is working out for my highest good.",
            "I am surrounded by abundance and infinite possibilities."
        ]
    };

    function calculate() {
        const input = inputEl.value.trim().toLowerCase();
        const results = [];

        let category = 'general';
        // Check relationships FIRST before love to avoid overlap
        if (input.includes('relationship') || input.includes('friend') || input.includes('partner') || input.includes('dating')) {
            category = 'relationships';
        }
        else if (input.includes('self') || input.includes('worth') || input.includes('accept')) {
            category = 'self';
        }
        else if (input.includes('confid') || input.includes('bold') || input.includes('brave')) {
            category = 'confidence';
        }
        else if (input.includes('success') || input.includes('achiev') || input.includes('goal')) {
            category = 'success';
        }
        else if (input.includes('health') || input.includes('fitness') || input.includes('body')) {
            category = 'health';
        }
        else if (input.includes('love')) {
            category = 'self';
        }

        const pool = affirmations[category];
        const count = 5;
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        for (let i = 0; i < count && i < shuffled.length; i++) {
            results.push(`${i + 1}. ${shuffled[i]}`);
        }

        outputEl.innerHTML = `<h3>Your Daily Affirmations</h3>\n${results.join('<br>')}`;
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            // Use innerHTML to preserve formatting in copy, matching what's displayed
            const textToCopy = outputEl.innerHTML.replace(/<br>/g, '\n').replace(/<h3>/g, '').replace(/<\/h3>/g, '');
            copyToClipboard(textToCopy);
        });
    }

    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
});
