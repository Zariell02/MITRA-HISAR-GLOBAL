# Mitra HisarGlobal V4 - Static Website

Versi V4 website statis promosi/konsultasi paket Umrah & Haji untuk mitra HisarGlobal.

## Stack
- HTML
- CSS
- JavaScript
- JSON
- Responsive layout
- CTA WhatsApp

## Cara menjalankan
Jangan langsung double-click HTML jika data paket tidak muncul. Jalankan server lokal dari folder project:

```bash
python -m http.server 8000
```

Buka: `http://localhost:8000`

## Ubah nomor WhatsApp
Buka `js/main.js`, lalu ganti:

```js
whatsappNumber: "6281234567890"
```

Gunakan format 62, bukan 0.

## Ubah data paket
Buka `data/packages.json`. Ubah judul, harga, durasi, fitur, dan pesan WhatsApp.

## Catatan
Untuk versi publik, gunakan data valid. Jangan memakai testimoni palsu, legalitas tanpa bukti, atau klaim sebagai penyelenggara utama jika client hanya mitra.
