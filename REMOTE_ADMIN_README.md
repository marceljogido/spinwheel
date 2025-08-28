# 🌐 Remote Admin Panel - Prize Wheel

## 🎯 Fitur Remote Admin

Admin panel Anda sekarang bisa diakses dari laptop lain melalui network! Fitur ini memungkinkan Anda mengelola prize wheel dari mana saja yang terhubung ke jaringan yang sama.

## 🚀 Cara Menggunakan

### 1. **Setup Server**
```bash
# Install dependencies server
npm install express cors

# Jalankan server
node server.js
```

### 2. **Akses dari Laptop Lain**

#### **Local Network (WiFi/LAN yang sama):**
- Buka browser di laptop lain
- Masukkan URL: `http://[IP_ADDRESS]:3001/admin`
- Contoh: `http://192.168.1.100:3001/admin`

#### **Internet (dari mana saja):**
- Aktifkan "Allow External Access" di tab Remote
- Setup port forwarding di router (port 3001)
- Gunakan public IP address

### 3. **Konfigurasi Network**

#### **Tab Network:**
- ✅ **Enable Remote Access** - Aktifkan akses remote
- 🌐 **Local IP** - IP address laptop utama di network
- 🔌 **Port** - Port untuk akses (default: 3001)
- 🌍 **External Access** - Akses dari internet

#### **Tab Access URLs:**
- 📋 **Copy URL** - Salin URL untuk akses remote
- 📱 **Device Compatibility** - Support laptop, mobile, tablet
- 📖 **Instructions** - Panduan lengkap penggunaan

#### **Tab Security:**
- 🔒 **Password Protection** - Proteksi dengan password
- 🛡️ **Security Tips** - Tips keamanan network
- ⚠️ **Security Warnings** - Peringatan keamanan

## 📱 Device Support

| Device | Compatibility | Features |
|--------|---------------|----------|
| **Laptop/Desktop** | ✅ Full Support | Full admin panel access |
| **Mobile/Tablet** | ✅ Responsive | Touch-friendly interface |
| **Any Browser** | ✅ Cross-platform | Chrome, Firefox, Safari, Edge |

## 🔧 Troubleshooting

### **Tidak bisa akses dari laptop lain?**
1. ✅ Pastikan "Enable Remote Access" aktif
2. ✅ Cek firewall Windows/antivirus
3. ✅ Pastikan kedua laptop di WiFi yang sama
4. ✅ Coba port berbeda (3001, 3002, 8080)

### **Port sudah digunakan?**
```bash
# Cek port yang sedang digunakan
netstat -an | findstr :3001

# Ganti port di server.js
const PORT = 3002; // atau port lain
```

### **IP Address tidak terdeteksi?**
- Manual input IP address laptop utama
- Cek di Command Prompt: `ipconfig`
- Look for "IPv4 Address" under WiFi adapter

## 🛡️ Security Best Practices

### **Untuk Local Network:**
- ✅ Gunakan password yang kuat
- ✅ Hanya aktifkan saat diperlukan
- ✅ Monitor akses secara berkala

### **Untuk Internet Access:**
- ⚠️ **HATI-HATI!** - Lebih berisiko
- 🔒 Gunakan password yang sangat kuat
- 🚫 Hanya aktifkan saat event berlangsung
- 🔄 Nonaktifkan setelah selesai
- 🛡️ Pertimbangkan menggunakan VPN

## 📊 Network Configuration

### **Default Settings:**
- **Port:** 3001
- **Local IP:** Auto-detect
- **Remote Access:** Disabled (default)
- **External Access:** Disabled (default)
- **Password Protection:** Enabled

### **Recommended Ports:**
- ✅ **3001-3010** - Development
- ✅ **8080-8090** - Alternative
- ✅ **5000-5010** - Modern apps
- ❌ **80, 443** - Reserved for HTTP/HTTPS
- ❌ **3000** - Common React dev port

## 🎮 Cara Akses Remote

### **Step-by-Step:**
1. **Di Laptop Utama:**
   - Buka Admin Panel
   - Tab "Remote"
   - Aktifkan "Enable Remote Access"
   - Catat IP Address dan Port

2. **Di Laptop Lain:**
   - Buka browser
   - Masukkan URL: `http://[IP]:[PORT]/admin`
   - Login dengan password admin
   - Mulai mengelola prize wheel!

### **Quick Test:**
```bash
# Test dari laptop utama dulu
curl http://localhost:3001/api/status

# Test dari laptop lain
curl http://192.168.1.100:3001/api/status
```

## 🔄 Update & Maintenance

### **Update Server:**
```bash
# Stop server (Ctrl+C)
# Update code
# Restart server
node server.js
```

### **Logs & Monitoring:**
- Server logs di console
- Network access logs
- Error handling & debugging

## 📞 Support

Jika ada masalah dengan remote admin:
1. ✅ Cek network configuration
2. ✅ Restart server
3. ✅ Test dari laptop utama dulu
4. ✅ Cek firewall settings
5. ✅ Verify IP address dan port

---

**🎉 Selamat! Sekarang Anda bisa mengelola prize wheel dari laptop lain!**
