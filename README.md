# 🎯 DigiOH Prize Wheel

Aplikasi prize wheel interaktif yang menarik dan mudah digunakan!

## ✨ Fitur Utama

- 🎡 **Prize Wheel Interaktif** - Roda keberuntungan dengan animasi menarik
- 🎨 **Customizable Prizes** - Tambah, edit, hapus hadiah dengan mudah
- 📱 **Responsive Design** - Bekerja sempurna di semua device
- ⚙️ **Admin Panel** - Kelola hadiah dan konfigurasi wheel
- 📊 **Statistics** - Lihat statistik spin dan hadiah yang dimenangkan

## 🚀 Cara Menjalankan

### **Development Mode (Frontend):**
```bash
npm install
npm run dev
```

### **Development Mode (Backend API):**
```bash
cd backend
npm install
npm run dev
```

Atur variabel lingkungan di `.env` (frontend) dan `backend/.env` agar `VITE_API_URL` menunjuk ke port API (default `http://localhost:4000`).

> **Catatan:** Panel admin kini membutuhkan login. Gunakan `ADMIN_USERNAME` dan `ADMIN_PASSWORD` yang Anda set di `backend/.env` untuk masuk dari antarmuka frontend.

### **Production Build:**
```bash
npm install
npm run build
npm run preview
```

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **UI Components:** Radix UI + Shadcn/ui
- **Build Tool:** Vite
- **Package Manager:** NPM

## 📁 Struktur Project

```
prize-wheel-whirl/
├── backend/                # Express + PostgreSQL API (pgAdmin friendly)
│   ├── src/
│   ├── package.json
│   └── .env.example
├── src/                    # React frontend source
│   ├── components/
│   ├── lib/
│   ├── pages/
│   └── types/
├── public/
├── package.json
└── README.md
```

## 🔧 Dependencies

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Express.js, CORS, Helmet, pg
- **UI:** Radix UI, Lucide Icons

## 📱 Device Support

- ✅ **Laptop/Desktop** - Full admin panel access
- ✅ **Mobile/Tablet** - Responsive interface
- ✅ **Any Browser** - Cross-platform compatibility

## 🎉 Selamat Menggunakan!

**DigiOH Prize Wheel** - Membuat event Anda lebih menarik dan mudah dikelola! 🎊
