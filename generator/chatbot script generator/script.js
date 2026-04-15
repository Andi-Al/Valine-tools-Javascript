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
// Chatbot Generator Logic
// ========================================
let flowCounter = 3;

function getFlows() {
    const rows = $$('.flow-row');
    const flows = [];
    rows.forEach(row => {
        const trigger = row.querySelector('.flow-trigger').value.trim();
        const response = row.querySelector('.flow-response').value.trim();
        if (trigger && response) {
            flows.push({ triggers: trigger.split(',').map(t => t.trim().toLowerCase()), response });
        }
    });
    return flows;
}

function generateCSSCode(themeColor, position) {
    const posCSS = position === 'bottom-left' ? 'left: 1.5rem;' : 'right: 1.5rem;';
    return `
.chatbot-widget * { box-sizing: border-box; margin: 0; padding: 0; }
.chatbot-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; }

/* Toggle Button */
.chatbot-toggle {
    position: fixed; bottom: 1.5rem; ${posCSS} width: 60px; height: 60px; border-radius: 50%;
    background: ${themeColor}; color: white; border: none; cursor: pointer; font-size: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; transition: transform 0.3s;
    display: flex; align-items: center; justify-content: center;
}
.chatbot-toggle:hover { transform: scale(1.1); }

/* Chat Window */
.chatbot-window {
    position: fixed; bottom: 5.5rem; ${posCSS} width: 350px; max-width: calc(100vw - 2rem);
    height: 450px; max-height: 70vh; background: white; border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 10001; display: none;
    flex-direction: column; overflow: hidden; animation: chatSlideUp 0.3s ease;
}
.chatbot-window.open { display: flex; }

@keyframes chatSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Header */
.chatbot-header {
    background: ${themeColor}; color: white; padding: 1rem; display: flex;
    align-items: center; justify-content: space-between;
}
.chatbot-header-title { font-weight: 600; font-size: 1rem; }
.chatbot-close {
    background: transparent; border: none; color: white; font-size: 1.5rem;
    cursor: pointer; line-height: 1;
}

/* Messages */
.chatbot-messages { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.chatbot-message { max-width: 80%; padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.9rem; line-height: 1.4; word-wrap: break-word; }
.chatbot-message.bot { background: #f1f5f9; color: #1f2937; align-self: flex-start; border-bottom-left-radius: 4px; }
.chatbot-message.user { background: ${themeColor}; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }

/* Typing Indicator */
.chatbot-typing { display: flex; gap: 4px; padding: 0.75rem 1rem; align-self: flex-start; }
.chatbot-typing span { width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: typingBounce 1.4s infinite; }
.chatbot-typing span:nth-child(2) { animation-delay: 0.2s; }
.chatbot-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-8px); }
}

/* Input Area */
.chatbot-input-area {
    display: flex; gap: 0.5rem; padding: 0.75rem; border-top: 1px solid #e5e7eb; background: #f9fafb;
}
.chatbot-input {
    flex: 1; border: 1px solid #d1d5db; border-radius: 20px; padding: 0.5rem 1rem;
    font-size: 0.9rem; outline: none;
}
.chatbot-input:focus { border-color: ${themeColor}; }
.chatbot-send {
    background: ${themeColor}; color: white; border: none; border-radius: 50%;
    width: 36px; height: 36px; cursor: pointer; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
}

/* Quick Replies */
.chatbot-quick-replies { display: flex; flex-wrap: wrap; gap: 0.35rem; padding: 0.25rem 0; }
.chatbot-quick-btn {
    background: white; border: 1px solid ${themeColor}; color: ${themeColor};
    border-radius: 16px; padding: 0.35rem 0.75rem; cursor: pointer; font-size: 0.8rem;
    transition: all 0.2s;
}
.chatbot-quick-btn:hover { background: ${themeColor}; color: white; }
`;
}

function generateJSCode(botName, greeting, flows, fallback, typingAnimation, inputPlaceholder) {
    const triggersJSON = JSON.stringify(flows.map(f => f.triggers));
    const responsesJSON = JSON.stringify(flows.map(f => f.response));

    return `
(function() {
    const BOT_NAME = "${botName}";
    const GREETING = "${greeting}";
    const FALLBACK = "${fallback}";
    const INPUT_PLACEHOLDER = "${inputPlaceholder}";
    const USE_TYPING = ${typingAnimation};

    const FLOWS = [
${flows.map((f, i) => `        { triggers: ${JSON.stringify(f.triggers)}, response: "${f.response.replace(/"/g, '\\"')}" }`).join(',\n')}
    ];

    function matchResponse(input) {
        const lower = input.toLowerCase();
        for (const flow of FLOWS) {
            if (flow.triggers.some(t => lower.includes(t))) {
                return flow.response;
            }
        }
        return FALLBACK;
    }

    function addMessage(text, type) {
        const messagesEl = document.querySelector('.chatbot-messages');
        const msgEl = document.createElement('div');
        msgEl.className = 'chatbot-message ' + type;
        msgEl.textContent = text;
        messagesEl.appendChild(msgEl);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
        if (!USE_TYPING) return;
        const messagesEl = document.querySelector('.chatbot-messages');
        const typingEl = document.createElement('div');
        typingEl.className = 'chatbot-typing';
        typingEl.id = 'chat-typing';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        messagesEl.appendChild(typingEl);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
        const typingEl = document.getElementById('chat-typing');
        if (typingEl) typingEl.remove();
    }

    function sendUserMessage(text) {
        if (!text.trim()) return;
        addMessage(text, 'user');
        showTyping();
        setTimeout(() => {
            hideTyping();
            const response = matchResponse(text);
            addMessage(response, 'bot');
        }, ${typingAnimation ? '800' : '100'});
    }

    // Toggle
    document.getElementById('chatbot-toggle').addEventListener('click', () => {
        document.querySelector('.chatbot-window').classList.toggle('open');
    });

    // Close
    document.getElementById('chatbot-close').addEventListener('click', () => {
        document.querySelector('.chatbot-window').classList.remove('open');
    });

    // Send
    document.getElementById('chatbot-send').addEventListener('click', () => {
        const input = document.getElementById('chatbot-input-field');
        sendUserMessage(input.value);
        input.value = '';
    });

    document.getElementById('chatbot-input-field').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('chatbot-send').click();
        }
    });
})();
`;
}

function generateEmbedCode(botName, greeting, flows, fallback, themeColor, position, typingAnimation, inputPlaceholder) {
    const css = generateCSSCode(themeColor, position);
    const js = generateJSCode(botName, greeting, flows, fallback, typingAnimation, inputPlaceholder);

    return `<!-- Chatbot Widget - ${botName} -->
<link rel="stylesheet" href="chatbot.css">
<button class="chatbot-toggle" id="chatbot-toggle">💬</button>
<div class="chatbot-window" id="chatbot-window">
    <div class="chatbot-header">
        <span class="chatbot-header-title">${botName}</span>
        <button class="chatbot-close" id="chatbot-close">&times;</button>
    </div>
    <div class="chatbot-messages">
        <div class="chatbot-message bot">${greeting}</div>
    </div>
    <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" id="chatbot-input-field" placeholder="${inputPlaceholder}">
        <button class="chatbot-send" id="chatbot-send">➤</button>
    </div>
</div>
<style>${css}</style>
<script>${js}<\/script>`;
}

function generateFullPage(botName, greeting, flows, fallback, themeColor, position, typingAnimation, inputPlaceholder) {
    const css = generateCSSCode(themeColor, position);
    const js = generateJSCode(botName, greeting, flows, fallback, typingAnimation, inputPlaceholder);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${botName}</title>
    <style>
        body { font-family: sans-serif; background: #f3f4f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .demo-text { text-align: center; color: #6b7280; }
        ${css}
    </style>
</head>
<body>
    <div class="demo-text">
        <h1>Demo: ${botName}</h1>
        <p>Click the chat button to start a conversation</p>
    </div>

    <button class="chatbot-toggle" id="chatbot-toggle">💬</button>
    <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-header">
            <span class="chatbot-header-title">${botName}</span>
            <button class="chatbot-close" id="chatbot-close">&times;</button>
        </div>
        <div class="chatbot-messages">
            <div class="chatbot-message bot">${greeting}</div>
        </div>
        <div class="chatbot-input-area">
            <input type="text" class="chatbot-input" id="chatbot-input-field" placeholder="${inputPlaceholder}">
            <button class="chatbot-send" id="chatbot-send">➤</button>
        </div>
    </div>

    <script>${js}<\/script>
</body>
</html>`;
}

function generateHTMLCode(botName, greeting, flows, fallback, themeColor, position, typingAnimation, inputPlaceholder) {
    return `<button class="chatbot-toggle" id="chatbot-toggle">💬</button>
<div class="chatbot-window" id="chatbot-window">
    <div class="chatbot-header">
        <span class="chatbot-header-title">${botName}</span>
        <button class="chatbot-close" id="chatbot-close">&times;</button>
    </div>
    <div class="chatbot-messages">
        <div class="chatbot-message bot">${greeting}</div>
    </div>
    <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" id="chatbot-input-field" placeholder="${inputPlaceholder}">
        <button class="chatbot-send" id="chatbot-send">➤</button>
    </div>
</div>`;
}

function renderPreview(botName, greeting, flows, fallback, themeColor, position, typingAnimation, inputPlaceholder) {
    const container = $('#preview-container');
    container.innerHTML = '';

    const posCSS = position === 'bottom-left' ? 'left: 0.5rem;' : 'right: 0.5rem;';

    const wrapper = createElement('div', {
        style: `position: relative; width: 100%; height: 400px; background: #f3f4f6; border-radius: 0.5rem; overflow: hidden;`
    });

    // Toggle button
    const toggle = createElement('button', {
        id: 'preview-toggle',
        style: `position: absolute; bottom: 1rem; ${posCSS} width: 50px; height: 50px; border-radius: 50%; background: ${themeColor}; color: white; border: none; cursor: pointer; font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10;`
    });
    toggle.textContent = '💬';

    // Chat window (open by default in preview)
    const chatWindow = createElement('div', {
        id: 'preview-window',
        style: `position: absolute; bottom: 4rem; ${posCSS} width: 300px; height: 350px; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 5; display: flex; flex-direction: column; overflow: hidden;`
    });

    // Header
    const header = createElement('div', {
        style: `background: ${themeColor}; color: white; padding: 0.75rem; display: flex; align-items: center; justify-content: space-between;`
    });
    header.innerHTML = `<span style="font-weight: 600; font-size: 0.9rem;">${botName}</span>`;
    const closeBtn = createElement('button', {
        style: `background: transparent; border: none; color: white; font-size: 1.25rem; cursor: pointer;`
    });
    closeBtn.textContent = '×';
    header.appendChild(closeBtn);
    chatWindow.appendChild(header);

    // Messages
    const messages = createElement('div', {
        id: 'preview-messages',
        style: `flex: 1; overflow-y: auto; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;`
    });

    // Greeting message
    const greetingMsg = createElement('div', {
        style: `max-width: 80%; padding: 0.6rem 0.8rem; border-radius: 12px; font-size: 0.85rem; line-height: 1.4; background: #f1f5f9; color: #1f2937; align-self: flex-start; border-bottom-left-radius: 4px;`
    });
    greetingMsg.textContent = greeting;
    messages.appendChild(greetingMsg);

    chatWindow.appendChild(messages);

    // Input area
    const inputArea = createElement('div', {
        style: `display: flex; gap: 0.35rem; padding: 0.5rem; border-top: 1px solid #e5e7eb; background: #f9fafb;`
    });
    const input = createElement('input', {
        type: 'text',
        id: 'preview-input',
        style: `flex: 1; border: 1px solid #d1d5db; border-radius: 20px; padding: 0.4rem 0.75rem; font-size: 0.85rem; outline: none;`,
        placeholder: inputPlaceholder
    });
    const sendBtn = createElement('button', {
        id: 'preview-send',
        style: `background: ${themeColor}; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 0.9rem;`
    });
    sendBtn.textContent = '➤';
    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);
    chatWindow.appendChild(inputArea);

    wrapper.appendChild(chatWindow);
    wrapper.appendChild(toggle);
    container.appendChild(wrapper);

    // Make it interactive
    let isChatOpen = true;

    function addPreviewMessage(text, type) {
        const msgEl = createElement('div', {
            style: `max-width: 80%; padding: 0.6rem 0.8rem; border-radius: 12px; font-size: 0.85rem; line-height: 1.4; align-self: ${type === 'user' ? 'flex-end' : 'flex-start'}; border-bottom-${type === 'user' ? 'right' : 'left'}-radius: 4px;`
        });
        msgEl.style.background = type === 'user' ? themeColor : '#f1f5f9';
        msgEl.style.color = type === 'user' ? 'white' : '#1f2937';
        msgEl.textContent = text;
        messages.appendChild(msgEl);
        messages.scrollTop = messages.scrollHeight;
    }

    function getBotResponse(userInput) {
        const lower = userInput.toLowerCase();
        for (const flow of flows) {
            if (flow.triggers.some(t => lower.includes(t))) {
                return flow.response;
            }
        }
        return fallback;
    }

    function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        addPreviewMessage(text, 'user');
        input.value = '';

        if (typingAnimation) {
            const typingEl = createElement('div', {
                id: 'preview-typing',
                style: `display: flex; gap: 4px; padding: 0.6rem 0.8rem; align-self: flex-start;`
            });
            typingEl.innerHTML = '<span style="width:8px;height:8px;background:#9ca3af;border-radius:50%;animation:typingBounce 1.4s infinite"></span><span style="width:8px;height:8px;background:#9ca3af;border-radius:50%;animation:typingBounce 1.4s infinite 0.2s"></span><span style="width:8px;height:8px;background:#9ca3af;border-radius:50%;animation:typingBounce 1.4s infinite 0.4s"></span>';
            messages.appendChild(typingEl);
            messages.scrollTop = messages.scrollHeight;

            setTimeout(() => {
                const typing = document.getElementById('preview-typing');
                if (typing) typing.remove();
                addPreviewMessage(getBotResponse(text), 'bot');
            }, 800);
        } else {
            setTimeout(() => addPreviewMessage(getBotResponse(text), 'bot'), 100);
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });

    toggle.addEventListener('click', () => {
        isChatOpen = !isChatOpen;
        chatWindow.style.display = isChatOpen ? 'flex' : 'none';
    });

    closeBtn.addEventListener('click', () => {
        isChatOpen = false;
        chatWindow.style.display = 'none';
    });
}

function generate() {
    const botName = $('#bot-name').value.trim() || 'MyChatBot';
    const greeting = $('#greeting').value.trim() || 'Hello!';
    const fallback = $('#fallback').value.trim() || "I didn't understand that.";
    const themeColor = $('#widget-theme').value;
    const position = $('#widget-position').value;
    const typingAnimation = $('#typing-animation').checked;
    const inputPlaceholder = $('#input-placeholder').value.trim() || 'Type a message...';
    const flows = getFlows();

    const embedCode = generateEmbedCode(botName, greeting, flows, fallback, themeColor, position, typingAnimation, inputPlaceholder);
    const htmlCode = generateHTMLCode(botName, greeting, flows, fallback, themeColor, position, typingAnimation, inputPlaceholder);
    const fullCode = generateFullPage(botName, greeting, flows, fallback, themeColor, position, typingAnimation, inputPlaceholder);

    $('#output-embed').textContent = embedCode;
    $('#output-html').textContent = htmlCode;
    $('#output-full').textContent = fullCode;

    renderPreview(botName, greeting, flows, fallback, themeColor, position, typingAnimation, inputPlaceholder);

    showToast('Chatbot generated!');
}

// ========================================
// Event Listeners
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Chatbot Script Generator', icon: '🤖' });

    // Generate button
    $('#generate-btn').addEventListener('click', generate);

    // Add flow button
    $('#add-flow-btn').addEventListener('click', () => {
        flowCounter++;
        const row = createElement('div', { className: 'flow-row', 'data-index': flowCounter });
        row.innerHTML = `
            <input type="text" class="form-input flow-trigger" placeholder="Trigger keywords (comma separated)">
            <textarea class="form-textarea flow-response" rows="2" placeholder="Bot response message"></textarea>
            <button class="btn-remove-flow" title="Remove">&times;</button>
        `;
        $('#flows-container').appendChild(row);
        row.querySelector('.btn-remove-flow').addEventListener('click', () => row.remove());
    });

    // Remove flow listeners
    $$('.btn-remove-flow').forEach(btn => {
        btn.addEventListener('click', () => {
            if ($$('.flow-row').length > 1) btn.closest('.flow-row').remove();
            else showToast('Minimum 1 flow required');
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
        if (code) copyToClipboard(code);
    });

    // Download button
    $('#download-btn').addEventListener('click', () => {
        const fullCode = $('#output-full').textContent;
        if (!fullCode) { showToast('Generate code first'); return; }
        const blob = new Blob([fullCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'chatbot.html';
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('File downloaded!');
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
