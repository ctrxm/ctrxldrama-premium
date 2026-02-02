# CTRXLDrama Premium

> Premium streaming platform with corporate UI, glassmorphism, and enhanced video player

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

## ✨ Features

- **Premium Corporate Design** - Deep navy blue color palette with royal blue accents
- **Glassmorphism UI** - Modern frosted glass effects throughout
- **Enhanced Video Player** - Optimized player from ctrxl-dracin with smooth playback
- **Responsive Design** - Mobile-first approach with optimized touch targets
- **Multi-Platform Support** - DramaBox, ReelShort, NetShort, Melolo, FlickReels, FreeReels
- **Smooth Animations** - Spring physics and easing functions
- **Premium Badges** - Gold accents for featured content

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## ☁️ Deploy to Cloudflare Pages

### Option 1: Automatic Deployment (Recommended)

1. **Connect to GitHub**
   - Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
   - Click "Create a project"
   - Connect your GitHub account
   - Select `ctrxldrama-premium` repository

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Build output directory: out
   Root directory: /
   ```

3. **Environment Variables** (Optional)
   - No environment variables required for basic deployment

4. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build to complete
   - Your site will be live at `https://your-project.pages.dev`

### Option 2: Manual Deployment via CLI

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy out --project-name=ctrxldrama-premium
```

## 📁 Project Structure

```
ctrxldrama-premium/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── watch/             # Watch pages with premium player
│   │   ├── detail/            # Detail pages
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── Header.tsx         # Premium header
│   │   ├── Footer.tsx         # Corporate footer
│   │   ├── PlatformSelector.tsx  # Premium platform tabs
│   │   ├── UnifiedMediaCard.tsx  # Enhanced media cards
│   │   └── OptimizedVideoPlayer.tsx  # Video player
│   ├── styles/
│   │   └── globals.css        # Premium CSS
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript types
├── public/                    # Static assets
│   ├── _headers              # Cloudflare headers
│   └── _redirects            # Cloudflare redirects
├── REDESIGN_NOTES.md         # Technical documentation
└── package.json
```

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Navy Blue | `#0A1628` | Primary background |
| Royal Blue | `#1E40AF` | Primary accent, CTAs |
| Electric Blue | `#3B82F6` | Hover states, highlights |
| Sky Blue | `#60A5FA` | Secondary accents |
| Gold | `#F59E0B` | Premium badges, featured |

### Typography

- **Font Family**: Inter
- **Weights**: 400, 500, 600, 700, 800

### Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

## 🔧 Technologies

- **Framework**: Next.js 16
- **React**: 18.3
- **Styling**: Tailwind CSS 3
- **TypeScript**: 5.8
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Animations**: Framer Motion (where needed)

## 📚 Documentation

- [REDESIGN_NOTES.md](./REDESIGN_NOTES.md) - Comprehensive redesign documentation

## 🔒 API

This project uses the SΛNSΞKΛI API for drama content:
- **API URL**: https://api.sansekai.my.id
- **Documentation**: Available at the API URL

All API logic from the original repository is preserved 100%.

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome/Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Mobile Safari | ✅ Full |
| Mobile Chrome | ✅ Full |

## 📝 License

This project maintains the same license as the original ctrxldrama repository.

## 👨‍💻 Credits

- **Original API**: [SΛNSΞKΛI API](https://api.sansekai.my.id)
- **Video Player**: Optimized from ctrxl-dracin repository
- **Design**: Premium corporate redesign
- **Developer**: Yusril

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Made with ❤️ by Yusril | Powered by SΛNSΞKΛI API
