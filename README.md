# 🎯 DigiOH Prize Wheel - Interactive Prize Wheel Application

<div align="center">

![DigiOH Logo](public/digioh-logo.ico)

**Interactive Prize Wheel with Remote Admin Panel**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/marceljogido/spinwheel)
[![GitHub stars](https://img.shields.io/github/stars/marceljogido/spinwheel?style=social)](https://github.com/marceljogido/spinwheel)
[![GitHub forks](https://img.shields.io/github/forks/marceljogido/spinwheel?style=social)](https://github.com/marceljogido/spinwheel)

</div>

## ✨ Features

### 🎮 **Interactive Prize Wheel**
- 🎯 Smooth spinning animations with 3D effects
- 🎨 Customizable prize segments with colors and images
- 🎊 Confetti effects and screen shake
- 📱 Fully responsive design for all devices
- 🎵 Sound effects and audio management

### 🔧 **Admin Panel**
- 📊 Real-time statistics and prize management
- 🖼️ Image upload for prizes
- ⚙️ Wheel configuration (size, animations, effects)
- 🎨 Drag & drop prize reordering
- 📈 Prize quota management

### 🌐 **Remote Access**
- 💻 Access admin panel from any device
- 🌍 Local network and internet access
- 🔒 Password protection and security
- 📱 Cross-platform compatibility
- 🚀 Vercel deployment ready

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Git

### **Installation**
```bash
# Clone repository
git clone https://github.com/marceljogido/spinwheel.git
cd spinwheel

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🎨 Customization

### **Prize Configuration**
```typescript
interface Prize {
  id: string;
  name: string;
  color: string;
  quota: number;
  won: number;
  image?: string;
}
```

### **Wheel Settings**
```typescript
interface WheelConfig {
  centerText: string;
  spinAnimation: 'smooth' | 'bounce' | 'natural';
  wheelSize: number;
  showConfetti: boolean;
  showShake: boolean;
  showGlow: boolean;
}
```

## 📱 Remote Admin Access

### **Local Network**
```
http://[YOUR_IP]:3001/admin
```

### **Internet (Vercel)**
```
https://your-app.vercel.app/admin
```

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **UI Components:** Shadcn/ui + Lucide Icons
- **Build Tool:** Vite
- **Deployment:** Vercel
- **Backend:** Node.js + Express (local) / Vercel Functions (production)

## 📁 Project Structure

```
spinwheel/
├── src/
│   ├── components/          # React components
│   │   ├── SpinWheel.tsx   # Main wheel component
│   │   ├── AdminPanel.tsx  # Admin interface
│   │   └── RemoteAdminPanel.tsx # Remote access
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── ui/                 # UI components
├── public/                 # Static assets
├── api/                    # Vercel API routes
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

## 🎯 Use Cases

- 🎉 **Event Management** - Corporate events, parties, exhibitions
- 🎮 **Gaming** - Interactive games and contests
- 🏆 **Rewards System** - Employee recognition, customer loyalty
- 🎪 **Entertainment** - Shows, fairs, amusement parks
- 📚 **Education** - Classroom activities, training sessions

## 🔧 Configuration

### **Environment Variables**
```bash
# .env.local
VITE_APP_TITLE=DigiOH Prize Wheel
VITE_API_URL=http://localhost:3001
```

### **Build Configuration**
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ]
}
```

## 📊 Performance

- ⚡ **Fast Loading** - Optimized bundle size
- 🎯 **Smooth Animations** - 60fps spinning effects
- 📱 **Mobile First** - Responsive design
- 🌐 **CDN Ready** - Vercel edge optimization

## 🛡️ Security

- 🔒 **Password Protection** - Admin panel security
- 🚫 **CORS Protection** - Cross-origin security
- 🛡️ **Input Validation** - XSS prevention
- 🔐 **HTTPS Ready** - SSL/TLS support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DigiOH** - For the amazing logo and branding
- **Shadcn/ui** - Beautiful UI components
- **Vercel** - Amazing deployment platform
- **React Community** - Excellent framework and ecosystem

## 📞 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/marceljogido/spinwheel/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/marceljogido/spinwheel/discussions)
- 📧 **Email:** Contact through GitHub profile

---

<div align="center">

**Made with ❤️ by [Marcel Jogido](https://github.com/marceljogido)**

**Powered by DigiOH**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/marceljogido)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>
