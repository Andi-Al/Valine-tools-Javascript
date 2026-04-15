# Checkbox Generator

> **Category**: Generator
> **Icon**: ☑️
> **Type**: Generator

## 📝 Description
**How it works:** Tool ini menghasilkan HTML markup untuk checkbox group dengan berbagai style (default, toggle switch, card select, custom icon), layout (vertical, horizontal, grid), dan fitur JavaScript seperti "Select All" functionality serta max selectable limit. User dapat menambahkan/menghapus item secara dinamis dan melihat preview secara real-time.

## 🚀 How to Use
1. Buka `index.html` di browser
2. Masukkan Group Name untuk checkbox group
3. Tambah/hapus checkbox items sesuai kebutuhan (label, value, checked default, disabled)
4. Pilih style (default, toggle switch, card select, custom icon)
5. Pilih layout (vertical, horizontal, grid) dan tentukan jumlah kolom jika grid
6. Atur theme color dengan color picker
7. Centang "Select All" untuk menambahkan tombol Select All
8. Tentukan max selectable (0 = unlimited)
9. Kode akan di-generate otomatis dan ditampilkan dalam tab: HTML, CSS, JS, Full Code
10. Copy kode yang diinginkan ke clipboard

## 📁 File Structure
```
checkbox generator/
├── index.html      # Main UI interface
├── script.js       # Generator logic, code generation, preview rendering
├── style.css       # Custom styling for UI and checkbox styles
└── README.md       # This file
```

## ⚡ Features
- Dynamic list untuk checkbox items (tambah/hapus)
- 4 style: default, toggle switch, card select, custom icon
- 3 layout: vertical, horizontal, grid columns
- Color picker untuk tema
- Select All / Deselect All functionality
- Max selectable limit (0 = unlimited)
- Live preview interaktif
- Output dalam 4 tab: HTML, CSS, JavaScript, Full Code
- Copy code ke clipboard
- Auto-generate saat input berubah (debounced)
- Mobile responsive design

## 🛠️ Technical Details
- **HTML5** - Semantic markup
- **CSS3** - Responsive design + custom checkbox styles
- **JavaScript (ES6+)** - No external dependencies
- **Standalone** - All assets self-contained (no shared.css/js required)

## 🐛 Troubleshooting
If you encounter issues:
1. Check browser console (F12) for errors
2. Ensure JavaScript is enabled
3. Try clearing browser cache
4. Verify all files are present in folder
5. Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

## 📊 Related Tools
Check other **generator** tools in the parent directory for complementary functionality.

---
*Created on 2026-04-15*
