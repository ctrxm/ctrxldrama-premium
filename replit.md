# CTRXLDrama Premium

## Overview
A premium streaming platform built with Next.js 16, featuring a corporate UI with glassmorphism design and an enhanced video player. The app aggregates drama content from multiple sources (DramaBox, ReelShort, NetShort, Melolo, FlickReels, FreeReels).

## Project Architecture

### Tech Stack
- **Framework**: Next.js 16.1.6 with App Router (Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **State Management**: Zustand + TanStack React Query
- **Backend Integration**: Supabase (authentication + database)
- **Video Player**: HLS.js for streaming

### Directory Structure
```
src/
├── app/           # Next.js App Router pages
│   ├── favorites/ # Favorites page
│   ├── history/   # Watch history page
│   └── detail/    # Drama detail pages
├── components/    # React components (UI + feature components)
├── contexts/      # React context providers
├── hooks/         # Custom React hooks (data fetching, utilities)
├── lib/           # Utility functions, API clients, Supabase config
├── styles/        # Additional CSS
└── types/         # TypeScript type definitions
```

### New Features (2026-02-04)
1. **Favorites/Watchlist** - Save dramas to favorites list
2. **Watch History** - Track watched episodes with resume playback
3. **Rating & Reviews** - Rate dramas with 1-5 stars and write reviews
4. **Comments** - Comment on dramas and episodes with replies
5. **Notifications** - Get notified when new episodes are released
6. **Share** - Share dramas to social media (WhatsApp, Telegram, Facebook, Twitter)
7. **Trending** - View trending dramas based on views and favorites
8. **Recommendations** - Personalized recommendations based on watch history

### Database Schema
New tables added in `supabase-features-schema.sql`:
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

## Recent Changes
- 2026-02-04: Added new user engagement features
  - Favorites/Watchlist system
  - Watch history with resume playback
  - Rating & review system
  - Comments with replies
  - Social media sharing
  - Notification system for new episodes
  - Trending and recommendations sections
  - Updated Header with notification bell
  - Created favorites and history pages
- 2026-02-04: Initial Replit setup
  - Configured Next.js to allow Replit dev origins
  - Fixed JSX syntax error in InfiniteDramaSection.tsx
  - Set up development workflow on port 5000
