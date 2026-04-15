# Caesar Cipher

> **Category**: Encryption
> **Icon**: 🔐
> **Type**: Cipher

## 📝 Description
**How it works:** Encrypt or decrypt text using the Caesar cipher algorithm with a configurable shift value (1-25). Supports English alphabet (A-Z) and Extended ASCII. Includes brute-force analysis showing all 25 possible shifts for cryptanalysis.

## 🚀 How to Use
1. Open `index.html` in your browser
2. Enter text in the input textarea
3. Set the shift value (1-25)
4. Select mode: Encrypt or Decrypt
5. Configure options: Preserve Case, Preserve Non-Alpha characters
6. Choose alphabet: English (A-Z) or Extended ASCII
7. Click "Encrypt / Decrypt" to process
8. View result and brute-force analysis table
9. Copy result to clipboard

## 📁 File Structure
```
caesar cipher/
├── index.html      # Main UI interface
├── script.js       # Caesar cipher encrypt/decrypt logic, brute-force analysis
├── style.css       # Custom styling
└── README.md       # This file
```

## ⚡ Features
- Encrypt and decrypt text using Caesar cipher
- Configurable shift value (1-25)
- Preserve case option (uppercase stays uppercase)
- Preserve non-alphabetic characters (spaces, numbers, symbols)
- English (A-Z) and Extended ASCII (256 chars) alphabet support
- Brute-force analysis: shows all 25 possible decryptions
- Highlighted correct shift in brute-force table
- Copy individual brute-force results
- Swap input/output for quick re-processing
- Auto-process on input change (debounced)
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
3. Try clearing browser cache
4. Verify all files are present in folder
5. Ensure you're using a modern browser

## 📊 Related Tools
Check other **Encryption** tools in the parent directory.

---
*Created on 2026-04-15*
