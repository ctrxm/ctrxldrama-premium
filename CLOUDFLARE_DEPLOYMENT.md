# Cloudflare Pages Deployment Guide

Panduan lengkap untuk deploy **CTRXLDrama Premium** ke Cloudflare Pages.

---

## 📋 Prerequisites

1. **Akun Cloudflare** - Daftar gratis di [cloudflare.com](https://cloudflare.com)
2. **GitHub Repository** - Repository sudah di-push ke GitHub
3. **Node.js** - Terinstall di local machine (untuk testing)

---

## 🚀 Metode 1: Automatic Deployment (Recommended)

### Step 1: Buka Cloudflare Pages Dashboard

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pilih akun Anda
3. Klik **"Workers & Pages"** di sidebar kiri
4. Klik **"Create application"**
5. Pilih tab **"Pages"**
6. Klik **"Connect to Git"**

### Step 2: Connect GitHub Repository

1. Klik **"Connect GitHub"**
2. Authorize Cloudflare untuk akses GitHub Anda
3. Pilih repository **`ctrxldrama-premium`**
4. Klik **"Begin setup"**

### Step 3: Configure Build Settings

Masukkan konfigurasi berikut:

```
Project name: ctrxldrama-premium
Production branch: main
```

**Build settings:**
```
Framework preset: Next.js (Static HTML Export)
Build command: npm run build
Build output directory: out
Root directory: /
```

**Environment variables:** (Optional, kosongkan jika tidak ada)
```
NODE_VERSION: 20.11.0
```

### Step 4: Deploy

1. Klik **"Save and Deploy"**
2. Tunggu proses build selesai (sekitar 2-5 menit)
3. Setelah selesai, Anda akan mendapat URL: `https://ctrxldrama-premium.pages.dev`

### Step 5: Custom Domain (Optional)

1. Di dashboard project, klik **"Custom domains"**
2. Klik **"Set up a custom domain"**
3. Masukkan domain Anda (contoh: `drama.yourdomain.com`)
4. Ikuti instruksi untuk update DNS records
5. Tunggu DNS propagation (5-30 menit)

---

## 🛠️ Metode 2: Manual Deployment via CLI

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login ke Cloudflare

```bash
wrangler login
```

Browser akan terbuka untuk authorize Wrangler.

### Step 3: Build Project

```bash
cd /path/to/ctrxldrama-premium
npm install
npm run build
```

### Step 4: Deploy ke Cloudflare Pages

```bash
wrangler pages deploy out --project-name=ctrxldrama-premium
```

Output akan menampilkan URL deployment Anda.

### Step 5: Setup Automatic Deployments (Optional)

Untuk auto-deploy setiap kali push ke GitHub:

```bash
wrangler pages project create ctrxldrama-premium --production-branch=main
```

---

## ⚙️ Build Configuration

### package.json Scripts

Project sudah dikonfigurasi dengan scripts berikut:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### next.config.ts

Konfigurasi untuk static export:

```typescript
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};
```

### Cloudflare Files

- **`public/_headers`** - Security headers dan caching
- **`public/_redirects`** - SPA routing fallback
- **`.node-version`** - Node.js version untuk build

---

## 🔧 Troubleshooting

### Build Failed: "Module not found"

**Solution:**
```bash
# Delete node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Images Not Loading

**Solution:**
Pastikan `next.config.ts` memiliki `images.unoptimized: true`

### 404 on Page Refresh

**Solution:**
Pastikan file `public/_redirects` ada dengan content:
```
/* /index.html 200
```

### Build Timeout

**Solution:**
Di Cloudflare Pages settings, increase build timeout:
1. Go to **Settings** → **Builds & deployments**
2. Set **Build timeout** to 20 minutes

### Environment Variables Not Working

**Solution:**
1. Go to **Settings** → **Environment variables**
2. Add variables untuk **Production** dan **Preview**
3. Redeploy project

---

## 📊 Performance Optimization

### Cloudflare CDN

Cloudflare Pages automatically provides:
- ✅ Global CDN distribution
- ✅ HTTP/3 support
- ✅ Brotli compression
- ✅ Automatic HTTPS
- ✅ DDoS protection

### Caching Strategy

Headers sudah dikonfigurasi di `public/_headers`:

```
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=31536000, immutable
```

### Image Optimization

Untuk optimize images lebih lanjut:

1. Use WebP format untuk images
2. Compress images sebelum upload
3. Use lazy loading (sudah implemented)

---

## 🔒 Security Headers

Security headers sudah dikonfigurasi di `public/_headers`:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), camera=(), geolocation=()...
```

---

## 📈 Monitoring & Analytics

### Cloudflare Web Analytics (Free)

1. Go to **Analytics** tab di dashboard
2. Enable **Web Analytics**
3. View metrics:
   - Page views
   - Unique visitors
   - Top pages
   - Traffic sources

### Custom Analytics (Optional)

Integrate Google Analytics atau Plausible:

1. Add tracking script di `src/app/layout.tsx`
2. Set environment variable untuk tracking ID
3. Redeploy

---

## 🔄 Continuous Deployment

### Automatic Deployments

Setelah setup, setiap push ke GitHub akan trigger automatic deployment:

1. **Production**: Push ke `main` branch
2. **Preview**: Push ke branch lain atau pull request

### Rollback

Jika ada masalah, rollback ke deployment sebelumnya:

1. Go to **Deployments** tab
2. Find previous successful deployment
3. Click **"..."** → **"Rollback to this deployment"**

---

## 💰 Pricing

### Cloudflare Pages Free Tier

- ✅ Unlimited sites
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds per month
- ✅ 1 concurrent build

### Paid Plan ($20/month)

- ✅ 5,000 builds per month
- ✅ 5 concurrent builds
- ✅ Advanced features

**Note:** Free tier sudah cukup untuk most use cases!

---

## 🎯 Post-Deployment Checklist

- [ ] Site accessible via HTTPS
- [ ] All pages loading correctly
- [ ] Images displaying properly
- [ ] Video player working
- [ ] Search functionality working
- [ ] Mobile responsive
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] SSL certificate active

---

## 📞 Support

### Cloudflare Support

- **Documentation**: https://developers.cloudflare.com/pages
- **Community**: https://community.cloudflare.com
- **Status**: https://www.cloudflarestatus.com

### Project Support

- **GitHub Issues**: Open issue di repository
- **Documentation**: Check REDESIGN_NOTES.md

---

## 🎉 Success!

Setelah deployment berhasil, website Anda akan:

- ✅ Live di `https://ctrxldrama-premium.pages.dev`
- ✅ Distributed globally via Cloudflare CDN
- ✅ Auto-deploy on every push to GitHub
- ✅ Protected by Cloudflare security
- ✅ Optimized for performance

---

**Happy Deploying! 🚀**

Made with ❤️ by Yusril | Powered by Cloudflare Pages
