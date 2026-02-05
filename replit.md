# CTRXLDrama Premium

## Overview
A premium streaming platform built with Next.js 16, featuring a corporate editorial UI design with flat aesthetics and an enhanced TikTok-style video player. The app aggregates drama content from multiple sources (DramaBox, ReelShort, NetShort, Melolo, FlickReels, FreeReels).

## Design Philosophy
- **Aesthetic**: Modern, premium streaming app style - smooth, refined, no "AI-template" looks
- **Color Palette**: Dark purple/violet theme with gradient accents (violet-500 to purple-600)
- **Typography**: Plus Jakarta Sans (all text) - clean and modern
- **Layout**: Card-based with 16px-24px rounded corners, smooth transitions
- **Effects**: Glass blur backgrounds, subtle gradients, smooth hover animations

## Project Architecture

### Tech Stack
- **Framework**: Next.js 16.1.6 with App Router (Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom utility classes
- **UI Components**: Custom components with corporate design system
- **State Management**: Zustand + TanStack React Query
- **Backend Integration**: Supabase (authentication + database)
- **Video Player**: HLS.js for streaming with TikTok-style auto-scroll

### Directory Structure
```
src/
├── app/           # Next.js App Router pages
│   ├── favorites/ # Favorites/Library page
│   ├── history/   # Watch history page
│   ├── detail/    # Drama detail pages
│   ├── watch/     # Video player pages
│   └── login/     # Authentication pages
├── components/    # React components (UI + feature components)
├── contexts/      # React context providers
├── hooks/         # Custom React hooks (data fetching, utilities)
├── lib/           # Utility functions, API clients, Supabase config
├── styles/        # Global CSS with design system
└── types/         # TypeScript type definitions
```

### Key Components
- **Header** - Minimal header with CTRXL DRAMA branding
- **PlatformSelector** - Tab-based platform switching
- **BottomNav** - Mobile navigation bar
- **UnifiedMediaCard** - Grid-based drama cards
- **TikTokPlayer** - Vertical video player with auto-scroll
- **FavoritesList** - Library management
- **WatchHistoryList** - Continue watching tracking

### Features
1. **Favorites/Watchlist** - Save dramas to favorites list
2. **Watch History** - Track watched episodes with resume playback
3. **Rating & Reviews** - Rate dramas with 1-5 stars and write reviews
4. **Comments** - Comment on dramas and episodes with replies
5. **Notifications** - Get notified when new episodes are released
6. **Share** - Share dramas to social media (WhatsApp, Telegram, Twitter)
7. **Trending** - View trending dramas based on views and favorites
8. **Recommendations** - Personalized recommendations based on watch history

### Database Schema
Tables in `supabase-features-schema.sql`:
- `favorites` - User favorite dramas
- `watch_history` - Watch progress tracking
- `ratings` - User ratings and reviews
- `comments` - Episode comments with replies
- `comment_likes` - Comment likes tracking
- `subscriptions` - Episode notification subscriptions
- `notifications` - User notifications
- `drama_stats` - Aggregated drama statistics

### Environment Variables
Required environment variables (stored in `.env.local`):
- `NEXT_PUBLIC_API_BASE_URL` - Drama API endpoint
- `NEXT_PUBLIC_CRYPTO_SECRET` - Encryption key for API
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Development

### Running Locally
The development server runs on port 5000:
```bash
npm run dev -- -p 5000 -H 0.0.0.0
```

### Building for Production
```bash
npm run build
npm run start
```

### Cloudflare Deployment
The project is configured for Cloudflare Workers deployment using `@opennextjs/cloudflare`:

```bash
# Build for Cloudflare
npm run build:cloudflare

# Preview locally with Wrangler
npm run preview:cloudflare

# Deploy to Cloudflare Workers
npm run deploy:cloudflare
```

**Note:** 
- Uses `@opennextjs/cloudflare` (replaces deprecated `@cloudflare/next-on-pages`)
- Requires `nodejs_compat` flag and `compatibility_date >= 2024-09-23`
- Configuration in `wrangler.toml` and `open-next.config.ts`

## Recent Changes
- 2026-02-05: Complete UI redesign to modern premium streaming style
  - Updated color scheme to purple/violet with gradient accents
  - Changed typography to Plus Jakarta Sans for modern look
  - Added glass blur backgrounds and smooth rounded corners
  - Redesigned Header with logo from /public/logo.png
  - Redesigned BottomNav with floating pill style
  - Redesigned PlatformSelector with horizontal chip style
  - Enhanced drama cards with premium hover effects
  - Added description modal to TikTok Player (like popular drama apps)
  - Preserved auto-scroll functionality in video player
  - Created custom CSS utility classes (glass-card, platform-chip, etc.)
- 2026-02-04: Added new user engagement features
  - Favorites/Watchlist system
  - Watch history with resume playback
  - Rating & review system
  - Comments with replies
  - Social media sharing
  - Notification system for new episodes
  - Trending and recommendations sections
- 2026-02-04: Initial Replit setup
  - Configured Next.js to allow Replit dev origins
  - Set up development workflow on port 5000
