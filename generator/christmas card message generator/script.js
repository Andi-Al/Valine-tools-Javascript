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
// Storage Helpers
// ========================================
const Storage = {
    get(key, defaultValue = null) {
        try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; }
        catch { return defaultValue; }
    },
    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
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
        textarea.value = text; textarea.style.position = 'fixed'; textarea.style.opacity = '0';
        document.body.appendChild(textarea); textarea.select(); document.execCommand('copy');
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
        toast = createElement('div', { id: 'toast-notification',
            style: 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(100px);background:#1f2937;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.875rem;z-index:9999;transition:transform 0.3s ease;box-shadow:0 4px 6px rgba(0,0,0,0.1);'
        });
        document.body.appendChild(toast);
    }
    toast.textContent = message; toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(100px)'; }, duration);
}

// ========================================
// Christmas Message Generator
// ========================================
const TEMPLATES = {
    family: {
        warm: [
            "Dear {recipient}, This Christmas, I'm so grateful to have you in my life. Thank you for all the love and support you've given me throughout the year. Wishing you a holiday filled with warmth, joy, and all the things that make your heart happiest. Love always, {sender}",
            "To my dearest {recipient}, Christmas is a time to celebrate the people who matter most, and you're at the top of my list. May this season bring you endless joy and beautiful memories. Merry Christmas with all my love, {sender}",
            "Dear {recipient}, As we gather around this holiday season, I want you to know how much our family means to me. Wishing you a Christmas full of love, laughter, and everything you've been hoping for. With love, {sender}"
        ],
        funny: [
            "Hey {recipient}, Another year of surviving family gatherings together! You're officially my favorite person to awkwardly stand next to at Christmas dinner. Merry Christmas! Don't worry, I won't tell anyone about your secret stash of cookies. Love, {sender}",
            "Dear {recipient}, Christmas is the one time of year when it's totally acceptable to eat cookies for breakfast. I hope you're taking full advantage! Merry Christmas to my favorite enabler of holiday indulgence. Love, {sender}",
            "To {recipient}, They say the best Christmas present is spending time with family. Clearly, they've never had to wrap your gifts. Just kidding! So grateful for you. Merry Christmas! Love, {sender}"
        ],
        religious: [
            "Dear {recipient}, May the blessing of the Lord shine upon you and your family this Christmas season. As we celebrate the birth of our Savior, may His love fill your home with peace and joy. Merry Christmas and God bless, {sender}",
            "To my beloved {recipient}, 'For unto us a Child is born, unto us a Son is given.' May this Christmas bring you closer to the true meaning of the season. Wishing you a blessed and holy holiday. With love in Christ, {sender}",
            "Dear {recipient}, This Christmas, let us remember the gift of God's love wrapped in a tiny baby. May His grace and mercy overflow in your life this holiday season. Merry Christmas and blessings to you, {sender}"
        ],
        professional: [
            "Dear {recipient}, Wishing you and your family a wonderful holiday season. As the year comes to a close, I'm grateful for the bond we share as family and the memories we've created. Best wishes for the new year. Warm regards, {sender}",
            "To {recipient}, As we celebrate this festive season, I want to express my appreciation for having you in our family. May the holidays bring you relaxation and renewed energy. Happy Holidays, {sender}",
            "Dear {recipient}, Season's greetings to you! May this holiday season be filled with meaningful moments and the new year bring fresh opportunities. Wishing you peace and prosperity. Warmest wishes, {sender}"
        ],
        heartfelt: [
            "Dear {recipient}, This Christmas, I'm so grateful for every moment we've shared. You've been my rock through thick and thin, and I couldn't imagine this season without you. Wishing you all the love in the world. Forever grateful, {sender}",
            "To my wonderful {recipient}, As the year draws to a close, I want you to know how deeply I cherish you. Your presence in my life is the greatest gift I could ever ask for. Merry Christmas from the bottom of my heart, {sender}",
            "Dear {recipient}, Some gifts can be wrapped, but the best ones come from the heart. Thank you for being the most precious part of my life. This Christmas, I celebrate you. With all my love, {sender}"
        ]
    },
    friends: {
        warm: [
            "Hey {recipient}! Christmas is here and I just wanted to say how lucky I am to have a friend like you. Thanks for all the laughs, the adventures, and the memories this year. Wishing you the most amazing holiday! Your friend, {sender}",
            "Dear {recipient}, As the snow falls and the lights go up, I'm thinking of you and all the good times we've shared. Merry Christmas to one of my favorite people! Let's make next year even better. Cheers, {sender}",
            "To {recipient}, Christmas isn't complete without thinking about the friends who make life worth living. You're one of them! Hope your holidays are as awesome as you are. Merry Christmas! Best, {sender}"
        ],
        funny: [
            "Hey {recipient}, Another year of putting up with me and you're still my friend — that deserves a Christmas medal! 🎅 Merry Christmas to my partner in crime. Next year, let's make even more questionable decisions together! Love, {sender}",
            "Dear {recipient}, Merry Christmas! I was going to get you something amazing, but then I remembered you already have my friendship. That's pretty amazing, right? 😄 Hope your holidays are lit! Yours, {sender}",
            "To {recipient}, Santa asked me what I want for Christmas and I said 'more time with my friends.' So here I am! Merry Christmas! Don't worry, I brought my own cookies. Cheers, {sender}"
        ],
        religious: [
            "Dear {recipient}, May the light of Christmas shine brightly in your life. As we celebrate the birth of Jesus, I thank God for the gift of your friendship. Merry Christmas and may His blessings be upon you always, {sender}",
            "To {recipient}, 'Every good and perfect gift is from above.' You're definitely one of those gifts in my life. Wishing you a blessed Christmas filled with God's love and grace. Merry Christmas, {sender}",
            "Dear {recipient}, This Christmas, let's remember that the greatest gift was given in a manger. May your heart be filled with His peace and joy. Grateful to call you my friend. God bless, {sender}"
        ],
        professional: [
            "Dear {recipient}, Wishing you a joyful holiday season and a prosperous new year. It's been great knowing you and I look forward to our continued friendship. Season's greetings, {sender}",
            "To {recipient}, As the year ends, I want to express my appreciation for your friendship. May the holidays bring you peace and the new year bring new opportunities. Warm regards, {sender}",
            "Dear {recipient}, Happy Holidays! May this festive season be a time of rest and reflection, and may the coming year bring you success and happiness. Best wishes, {sender}"
        ],
        heartfelt: [
            "Dear {recipient}, True friends are hard to find, and I struck gold with you. This Christmas, I want you to know how much your friendship means to me. Through every high and low, you've been there. Merry Christmas from my heart to yours, {sender}",
            "To my amazing friend {recipient}, They say friends are the family you choose, and I'm so glad I chose you. Every moment with you is a gift. Wishing you a Christmas as beautiful as your soul. Love, {sender}",
            "Dear {recipient}, As Christmas lights illuminate the streets, your friendship illuminates my life. Thank you for being the kind of friend everyone wishes they had. Merry Christmas, you're truly special, {sender}"
        ]
    },
    coworkers: {
        warm: [
            "Dear {recipient}, It's been a pleasure working alongside you this year. Your positive energy and teamwork make every day at the office brighter. Wishing you a joyful holiday season and a wonderful new year! Warm regards, {sender}",
            "To {recipient}, As we close out another year, I want to thank you for being such a great colleague. Your hard work and dedication don't go unnoticed. Merry Christmas and happy holidays! Best, {sender}",
            "Dear {recipient}, The holiday season is a great time to reflect on the year, and I'm grateful to have you as a coworker. Wishing you rest, relaxation, and quality time with loved ones. Happy Holidays, {sender}"
        ],
        funny: [
            "Dear {recipient}, Merry Christmas! I hope your holidays are as stress-free as a Monday morning when the boss says 'take the week off.' Just kidding! But seriously, you deserve the best. See you next year — refreshed and caffeinated! Cheers, {sender}",
            "To {recipient}, Another year of surviving meetings that could've been emails! You're a champ. Merry Christmas to the person who makes the office bearable. May your PTO be uninterrupted and your inbox empty! Yours, {sender}",
            "Dear {recipient}, Christmas is the time to unplug, unwind, and pretend your email doesn't exist. Enjoy every minute of it! Merry Christmas to my favorite coworker (don't tell the others). See you in the new year! Best, {sender}"
        ],
        religious: [
            "Dear {recipient}, May the peace and joy of Christmas fill your heart and home. As we celebrate the birth of our Savior, I pray that God's blessings overflow in your life and work. Merry Christmas, {sender}",
            "To {recipient}, 'The Lord bless you and keep you.' Wishing you a Christmas filled with God's love and a new year filled with His guidance. It's been a blessing working with you. Merry Christmas, {sender}",
            "Dear {recipient}, This holiday season, may the light of Christ shine upon you and your family. Thank you for being such a wonderful colleague. Wishing you a blessed Merry Christmas, {sender}"
        ],
        professional: [
            "Dear {recipient}, Wishing you a wonderful holiday season and a prosperous new year. Thank you for your collaboration and dedication throughout the year. It's been a pleasure working with you. Best regards, {sender}",
            "To {recipient}, As the year draws to a close, I want to express my appreciation for your professionalism and teamwork. May the holidays bring you well-deserved rest and the new year bring new achievements. Happy Holidays, {sender}",
            "Dear {recipient}, Season's greetings! May this holiday season be a time of reflection and renewal, and may the coming year bring continued success to you and your family. Warm wishes, {sender}"
        ],
        heartfelt: [
            "Dear {recipient}, Working with you has been one of the highlights of my year. Beyond being a great colleague, you've been a true friend. This Christmas, I want you to know how much I value both our professional and personal bond. Merry Christmas, {sender}",
            "To {recipient}, In the busy world of work, it's rare to find someone who is both an excellent colleague and a genuine friend. You're that person. Wishing you a Christmas filled with love and warmth. With gratitude, {sender}",
            "Dear {recipient}, As we wrap up the year, I want to say thank you — not just for the great work, but for the kindness, patience, and camaraderie you bring every day. Merry Christmas from the bottom of my heart, {sender}"
        ]
    },
    clients: {
        warm: [
            "Dear {recipient}, As the holiday season approaches, I want to take a moment to thank you for your trust and partnership this year. Wishing you and your loved ones a joyful Christmas and a prosperous new year! Warmly, {sender}",
            "To {recipient}, This Christmas, I'm grateful for clients like you who make our work meaningful. Thank you for choosing us. May your holidays be filled with joy and celebration. Happy Holidays, {sender}",
            "Dear {recipient}, It's been a pleasure serving you this year. As we celebrate the season of giving, I want to express our appreciation for your continued trust. Merry Christmas and best wishes for the new year, {sender}"
        ],
        funny: [
            "Dear {recipient}, Merry Christmas! Don't worry, this isn't a sales email — just a genuine wish for you to have an amazing holiday. No calls to action, no deadlines. Just cookies and cozy moments. See you in the new year! Best, {sender}",
            "To {recipient}, I promise this is the last email you'll get from me this year that doesn't require a response! 😄 Merry Christmas and thank you for being a wonderful client. Enjoy the holidays guilt-free! Cheers, {sender}",
            "Dear {recipient}, Christmas is the one time when 'replying to emails' can wait until January. Take the break you deserve! Merry Christmas and thank you for a great year of collaboration. Happy Holidays, {sender}"
        ],
        religious: [
            "Dear {recipient}, May the blessings of the Christmas season be upon you and your family. Thank you for the privilege of working together. Wishing you a Merry Christmas filled with God's grace and peace, {sender}",
            "To {recipient}, As we celebrate the birth of Christ, I pray that His love and peace fill your home and heart. Thank you for your trust and partnership. Merry Christmas and God bless, {sender}",
            "Dear {recipient}, 'Glory to God in the highest.' May this Christmas bring you spiritual renewal and joy. Thank you for being a valued client. Wishing you a blessed holiday season, {sender}"
        ],
        professional: [
            "Dear {recipient}, Thank you for your trust and partnership throughout the year. It has been our pleasure to serve you, and we look forward to continuing our work together in the new year. Happy Holidays and best wishes, {sender}",
            "To {recipient}, As the year comes to a close, we want to express our gratitude for your continued confidence in our services. Wishing you a pleasant holiday season and a successful new year. Sincerely, {sender}",
            "Dear {recipient}, Season's greetings! Your satisfaction has been our driving force this year, and we are committed to delivering even greater value in the coming year. Wishing you prosperity and happiness, {sender}"
        ],
        heartfelt: [
            "Dear {recipient}, Behind every successful project is a relationship built on trust and mutual respect. You've been more than a client — you've been a partner we deeply value. This Christmas, I celebrate our collaboration. Warm wishes, {sender}",
            "To {recipient}, As the holiday season reminds us to be grateful, you're at the top of my list. Thank you for believing in our work and giving us the opportunity to serve you. Merry Christmas with genuine appreciation, {sender}",
            "Dear {recipient}, Some business relationships evolve into genuine respect and appreciation. Ours is one of them. This Christmas, I want to thank you from the bottom of my heart for your trust and loyalty. Warmest regards, {sender}"
        ]
    },
    teachers: {
        warm: [
            "Dear {recipient}, This Christmas, I want to thank you for your dedication and patience in shaping young minds. Your impact goes far beyond the classroom. Wishing you a holiday filled with rest and joy! With gratitude, {sender}",
            "To {recipient}, Thank you for all that you do — not just teaching, but inspiring. Christmas is the perfect time to recognize the difference you make every single day. Merry Christmas and happy holidays, {sender}",
            "Dear {recipient}, Your passion for teaching lights up the classroom and the lives of your students. As the year ends, I hope you get the rest and appreciation you truly deserve. Merry Christmas, {sender}"
        ],
        funny: [
            "Dear {recipient}, Merry Christmas! You've earned a break after dealing with an entire classroom of energetic humans. I hope your holidays involve zero grading, zero emails, and maximum hot chocolate. You deserve it! Cheers, {sender}",
            "To {recipient}, Santa's making a special stop this year — teachers who survive parent-teacher conferences deserve extra presents! 😄 Merry Christmas and enjoy your well-deserved time off. No homework for you! Best, {sender}",
            "Dear {recipient}, They say teaching is the profession that creates all other professions. So this Christmas, I hope the universe returns the favor with tons of relaxation! Merry Christmas to a real superhero, {sender}"
        ],
        religious: [
            "Dear {recipient}, May the Christmas season bring you the same joy and inspiration you bring to your students every day. As we celebrate the birth of our Savior, may His love guide you in the coming year. Merry Christmas, {sender}",
            "To {recipient}, 'Train up a child in the way he should go.' You live this verse every day in your classroom. May God bless you abundantly this Christmas and throughout the new year. With prayers, {sender}",
            "Dear {recipient}, Your dedication to education is a true blessing. This Christmas, I pray that God's peace and joy fill your heart and that the new year brings you renewed strength and purpose. Merry Christmas, {sender}"
        ],
        professional: [
            "Dear {recipient}, Wishing you a restful holiday season and a rewarding new year. Your contribution to education is invaluable, and your dedication does not go unnoticed. Happy Holidays with great respect, {sender}",
            "To {recipient}, As the academic year pauses for the holidays, I want to express my appreciation for your professionalism and commitment to excellence in teaching. Season's greetings and best wishes, {sender}",
            "Dear {recipient}, May this holiday season provide you with the opportunity to recharge and reflect on the positive impact you've made this year. Wishing you a Merry Christmas and a prosperous new year, {sender}"
        ],
        heartfelt: [
            "Dear {recipient}, A great teacher doesn't just teach — they inspire, they nurture, and they change lives. You've done all of that and more. This Christmas, please know that your efforts are deeply seen and appreciated. With heartfelt thanks, {sender}",
            "To {recipient}, The mark of a great teacher is measured in the lives they touch. By that standard, you're extraordinary. Thank you for giving so much of yourself to your students. Merry Christmas from the bottom of my heart, {sender}",
            "Dear {recipient}, Words can hardly express how grateful I am for your dedication, patience, and heart. You make the world better one student at a time. This Christmas, I celebrate you. With deepest appreciation, {sender}"
        ]
    },
    romantic: {
        warm: [
            "My dearest {recipient}, Christmas is so much more magical with you by my side. Thank you for filling my days with love and my heart with happiness. You're the best gift I could ever ask for. Merry Christmas, my love, {sender}",
            "To my wonderful {recipient}, Every Christmas light reminds me of the sparkle you bring to my life. I'm so lucky to spend this holiday season with someone as amazing as you. All my love, {sender}",
            "Dear {recipient}, The best thing about Christmas isn't the presents under the tree — it's having you in my life. You make every moment feel like a celebration. Merry Christmas, sweetheart, {sender}"
        ],
        funny: [
            "Dear {recipient}, I love you more than Christmas cookies. And you KNOW how much I love Christmas cookies. That's saying something! Merry Christmas to my favorite person to annoy for the rest of my life. Love, {sender}",
            "To {recipient}, Santa asked what I wanted and I said 'the person reading this.' Turns out I already have you, so I guess I'm getting nothing else! 😄 Merry Christmas, babe. You're stuck with me. Love, {sender}",
            "Dear {recipient}, They say the best things in life are free. That's weird because you seem pretty priceless to me. Oh well, I'll settle for cuddling by the fireplace! Merry Christmas, gorgeous, {sender}"
        ],
        religious: [
            "My beloved {recipient}, God blessed me beyond measure when He brought you into my life. As we celebrate the greatest gift of all — His Son — I'm reminded that you're the most precious gift in my life. Merry Christmas, my love, {sender}",
            "To {recipient}, 'I have found the one whom my soul loves.' This Christmas, my heart overflows with gratitude for you and for God's perfect plan. May His love surround us always. Merry Christmas, darling, {sender}",
            "Dear {recipient}, This Christmas, I thank God for the miracle of love — the love He showed us and the love He placed in my heart for you. You are my answered prayer. Merry Christmas, my everything, {sender}"
        ],
        professional: [
            "Dear {recipient}, As the holiday season arrives, I want to express my deepest appreciation for the love and companionship you bring into my life. Wishing you a Christmas filled with elegance and warmth. Yours truly, {sender}",
            "To {recipient}, This festive season, I reflect on the grace and beauty you add to every moment of my life. May your Christmas be as refined and wonderful as you are. With admiration, {sender}",
            "Dear {recipient}, Wishing you a Christmas that is as graceful and magnificent as the love you've shown me. May the new year bring us even closer together. With deepest respect and love, {sender}"
        ],
        heartfelt: [
            "My darling {recipient}, You are the reason I believe in magic. Every moment with you feels like a Christmas miracle I never saw coming. I love you more than words could ever capture. Merry Christmas, my forever love, {sender}",
            "To my heart's {recipient}, If I could wrap up all the love I feel for you, it would fill the entire world. But for now, I'll settle for this card and a lifetime of Christmases together. You're my everything, {sender}",
            "Dear {recipient}, My heart knew something special was coming the day I met you. Now, every Christmas reminds me how blessed I am to call you mine. I love you endlessly and eternally. Merry Christmas, my soulmate, {sender}"
        ]
    }
};

const CHRISTMAS_QUOTES = [
    "\"Christmas is not as much about opening our presents as opening our hearts.\" — Janice Maeditere",
    "\"Peace on earth will come to stay, when we live Christmas every day.\" — Henry Van Dyke",
    "\"The best way to spread Christmas cheer is singing loud for all to hear.\" — Buddy the Elf",
    "\"Christmas is doing a little something extra for someone.\" — Charles Schulz",
    "\"Blessed is the season which engages the whole world in a conspiracy of love.\" — Helen Hunt Jackson",
    "\"Let us keep Christmas beautiful without a thought of self.\" — L.M. Montgomery",
    "\"Christmas waves a magic wand over this world, and behold, everything is softer and more beautiful.\" — Norman Vincent Peale",
    "\"The joy of Christmas is not in what we get, but in what we give.\" — Anonymous",
    "\"Joy to the World! The Lord is come, let earth receive her King.\" — Isaac Watts",
    "\"For God so loved the world that He gave His only begotten Son.\" — John 3:16"
];

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateMessage(category, tone, sender, recipient, includeQuote, personalMessage) {
    const categoryTemplates = TEMPLATES[category]?.[tone] || TEMPLATES.family.warm;
    let message = randomFrom(categoryTemplates);

    message = message.replace(/{recipient}/g, recipient);
    message = message.replace(/{sender}/g, sender);

    if (personalMessage.trim()) {
        message += `\n\nP.S. ${personalMessage.trim()}`;
    }

    if (includeQuote) {
        const quote = randomFrom(CHRISTMAS_QUOTES);
        message += `\n\n🎄 ${quote}`;
    }

    return message;
}

function generate() {
    const sender = $('#sender-name').value.trim() || 'Your Name';
    const recipient = $('#recipient-name').value.trim() || 'Friend';
    const category = $('#category').value;
    const tone = $('#tone').value;
    const includeQuote = $('#include-quote').checked;
    const personalMessage = $('#personal-message').value.trim();
    const count = Math.min(Math.max(parseInt($('#message-count').value) || 3, 1), 10);

    const container = $('#messages-container');
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const message = generateMessage(category, tone, sender, recipient, includeQuote, personalMessage);

        const card = createElement('div', { className: 'message-card' });
        const header = createElement('div', {
            className: 'message-card-header',
            style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;'
        });
        const numLabel = createElement('span', {
            className: 'message-number',
            textContent: `Message ${i + 1}`,
            style: 'font-weight: 600; color: var(--gray-600); font-size: 0.85rem;'
        });
        const copyBtn = createElement('button', {
            className: 'btn-copy-msg',
            textContent: '📋',
            style: 'background: transparent; border: none; cursor: pointer; font-size: 1.1rem; padding: 0.25rem;',
            onClick: () => copyToClipboard(message)
        });
        header.appendChild(numLabel);
        header.appendChild(copyBtn);

        const textEl = createElement('div', {
            className: 'message-text',
            textContent: message,
            style: 'background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 1rem; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap;'
        });

        card.appendChild(header);
        card.appendChild(textEl);
        card.style.marginBottom = '0.75rem';
        container.appendChild(card);
    }

    showToast(`${count} message${count > 1 ? 's' : ''} generated!`);
}

// ========================================
// Event Listeners
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Christmas Card Message Generator', icon: '🎄' });

    $('#generate-btn').addEventListener('click', generate);
    $('#regenerate-btn').addEventListener('click', generate);

    $('#copy-all-btn').addEventListener('click', () => {
        const cards = $$('.message-text');
        if (cards.length === 0) { showToast('Generate messages first'); return; }
        const allText = Array.from(cards).map((c, i) => `--- Message ${i + 1} ---\n${c.textContent}`).join('\n\n');
        copyToClipboard(allText);
    });

    const debouncedGenerate = debounce(generate, 300);
    $$('#tool-content input, #tool-content select, #tool-content textarea').forEach(el => {
        el.addEventListener('input', debouncedGenerate);
        el.addEventListener('change', debouncedGenerate);
    });

    generate();
});
