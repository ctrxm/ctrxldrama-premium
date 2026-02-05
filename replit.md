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
│   ├── chat/      # Community chat page
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
- **UniversalPlayer** - Unified video player for all providers (DramaBox-style UI)
- **TikTokPlayer** - Legacy vertical video player (deprecated, use UniversalPlayer)
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
9. **Community Chat** - Real-time chat for all users (view), registered users can send messages
10. **VIP Membership** - Premium subscription with ad-free experience, HD quality, VIP badge

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

Tables in `supabase-chat-schema.sql`:
- `chat_messages` - Community chat messages with real-time sync

Tables in `supabase-vip-schema.sql`:
- `vip_subscriptions` - VIP membership subscriptions with payment tracking

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
- 2026-02-05: Unified Video Player across all providers
  - Created UniversalPlayer component with DramaBox-style UI
  - All providers now use the same player design (ReelShort, NetShort, Melolo, FlickReels, FreeReels)
  - Custom controls: play/pause, mute, quality selector, speed control, episode navigation
  - HD quality gating with VIP lock icons
  - Episode list modal with grid layout
  - Description modal for drama info
  - Support for both HLS streams and direct MP4 URLs
  - Keyboard shortcuts (space, m, arrow up/down)
- 2026-02-05: Added VIP Admin Panel
  - VIP Management page in admin dashboard (/admin/vip)
  - Approve/Reject pending VIP subscription requests
  - Revoke active VIP subscriptions
  - Filter by status (pending, active, expired, all)
  - Stats cards showing pending, active VIP, revenue
  - Payment proof viewer modal
  - Added VIP link to BottomNav mobile navigation with amber styling
  - Added admin policy for viewing all users data
- 2026-02-05: Enhanced VIP Membership System
  - Fixed HD quality gating - non-VIP users can only access SD quality (< 720p)
  - HD quality options show lock icon and redirect to VIP page when clicked
  - Auto mode now selects from available (non-HD) videos for non-VIP users
  - Optimized ads loading - VIP users skip ad fetching entirely
  - VIP badge in chat uses actual VIP status from database
- 2026-02-05: Added VIP Membership System
  - VIP subscription page with QRIS payment
  - Ad-free experience for VIP users
  - VIP badge in chat messages
  - Monthly, yearly, and lifetime plans
- 2026-02-05: Replaced Browse with Community Chat feature
  - Real-time chat using Supabase realtime subscriptions
  - All users can view messages
  - Only registered users can send messages
  - Delete own messages functionality
  - Time-ago display for message timestamps
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
