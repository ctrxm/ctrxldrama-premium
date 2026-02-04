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
├── components/    # React components (UI + feature components)
├── contexts/      # React context providers
├── hooks/         # Custom React hooks (data fetching, utilities)
├── lib/           # Utility functions, API clients, Supabase config
├── styles/        # Additional CSS
└── types/         # TypeScript type definitions
```

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
- 2026-02-04: Initial Replit setup
  - Configured Next.js to allow Replit dev origins
  - Fixed JSX syntax error in InfiniteDramaSection.tsx
  - Set up development workflow on port 5000
