# CGI Script Generator

> **Category**: Developer Tools
> **Icon**: 🖥️
> **Type**: Generator

## 📝 Description
**How it works:** Generate CGI scripts in Python, Perl, Bash, or PHP that process web form data with input validation, HTML sanitization (XSS prevention), and formatted HTML responses. Also generates a compatible HTML form.

## 🚀 How to Use
1. Open `index.html` in your browser
2. Select script language (Python, Perl, Bash, PHP)
3. Set form action URL and HTTP method (GET/POST)
4. Add/remove form fields with type and required setting
5. Configure success and error redirect URLs
6. Click "Generate CGI Script"
7. View generated CGI script and HTML form in tabs
8. Copy code or download the script file

## 📁 File Structure
```
cgi script generator/
├── index.html      # Main UI interface
├── script.js       # CGI script generation logic for 4 languages
├── style.css       # Custom styling
└── README.md       # This file
```

## ⚡ Features
- 4 language support: Python 3, Perl, Bash, PHP
- GET and POST method support
- Dynamic form field builder (text, email, number, textarea, select, checkbox)
- Required field validation
- Email format validation
- Number validation
- HTML sanitization (XSS prevention)
- Error handling with formatted error pages
- Generated HTML form compatible with CGI script
- Copy code and download script functionality
- Auto-generate on input change (debounced)
- Mobile responsive design

## 🛠️ Technical Details
- **HTML5** - Semantic markup
- **CSS3** - Responsive design
- **JavaScript (ES6+)** - No external dependencies
- **Standalone** - All assets self-contained

## 🐛 Troubleshooting
If you encounter issues:
1. Check browser console (F12) for errors
2. Ensure JavaScript is enabled
3. Verify all files are present in folder
4. Ensure you're using a modern browser

## 📊 Related Tools
Check other **Developer Tools** in the parent directory.

---
*Created on 2026-04-15*
