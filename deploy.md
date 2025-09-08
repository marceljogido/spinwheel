# 🚀 Deployment Guide - Prize Wheel App

## Opsi Hosting Gratis

### 1. Vercel (Recommended) ⭐

**Keunggulan:**
- Deploy otomatis dari GitHub
- CDN global untuk performa cepat
- SSL certificate otomatis
- Custom domain support
- Preview deployments untuk setiap PR

**Langkah-langkah:**
1. Push code ke GitHub repository
2. Buka [vercel.com](https://vercel.com)
3. Sign up dengan GitHub account
4. Click "New Project"
5. Import repository
6. Deploy otomatis dalam 2 menit!

**URL akan seperti:** `https://prize-wheel-app.vercel.app`

### 2. Netlify

**Keunggulan:**
- Drag & drop deployment
- Form handling
- Branch previews
- Easy custom domain

**Langkah-langkah:**
1. Build project: `npm run build`
2. Buka [netlify.com](https://netlify.com)
3. Drag folder `dist` ke Netlify
4. Atau connect ke GitHub repository

**URL akan seperti:** `https://amazing-app-123456.netlify.app`

### 3. GitHub Pages

**Keunggulan:**
- Hosting langsung dari GitHub
- Custom domain support
- SSL otomatis

**Langkah-langkah:**
1. Push code ke GitHub
2. Go to repository Settings > Pages
3. Select source: GitHub Actions
4. Workflow akan otomatis deploy

**URL akan seperti:** `https://username.github.io/repository-name`

### 4. Firebase Hosting

**Keunggulan:**
- Google infrastructure
- Fast global CDN
- Easy deployment

**Langkah-langkah:**
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Init: `firebase init hosting`
4. Deploy: `firebase deploy`

## Build untuk Production

```bash
# Install dependencies
npm install

# Build untuk production
npm run build

# Preview build lokal
npm run preview
```

## Optimasi yang Sudah Diterapkan

✅ **Vercel Configuration** - `vercel.json`
✅ **Netlify Configuration** - `netlify.toml`  
✅ **GitHub Actions** - `.github/workflows/deploy.yml`
✅ **Build Optimization** - Vite production build
✅ **Asset Caching** - Cache headers untuk audio & assets
✅ **SPA Routing** - Redirect semua routes ke index.html

## Custom Domain

Setelah deploy, Anda bisa:
1. Beli domain di Namecheap, GoDaddy, atau registrar lain
2. Connect domain ke hosting provider
3. Update DNS settings
4. SSL certificate otomatis

## Monitoring & Analytics

- **Vercel Analytics** - Built-in performance monitoring
- **Google Analytics** - Add tracking code
- **Sentry** - Error monitoring
- **Hotjar** - User behavior analytics

## Tips Production

1. **Environment Variables** - Gunakan untuk API keys
2. **Error Boundaries** - Handle errors gracefully  
3. **Loading States** - Better UX
4. **SEO Optimization** - Meta tags, sitemap
5. **PWA Features** - Offline support, installable

## Troubleshooting

**Build Error:**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Audio Not Playing:**
- Pastikan file audio ada di `public/sounds/`
- Check browser console untuk errors
- Test di incognito mode

**Routing Issues:**
- Pastikan `vercel.json` atau `netlify.toml` ada
- Check redirect rules

## Support

Jika ada masalah deployment, check:
1. Build logs di hosting provider
2. Browser console untuk errors
3. Network tab untuk failed requests
4. GitHub Actions logs (jika pakai GitHub Pages)
