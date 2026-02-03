# Admin Panel Setup Guide

## Features Implemented

### ✅ Admin Panel
- Live statistics dashboard with real-time updates
- User management
- Ads management (create, edit, delete, toggle active)
- Maintenance mode control

### ✅ Authentication System
- User registration and login
- Role-based access (user/admin)
- Protected admin routes
- Session management with Supabase Auth

### ✅ Supabase Backend
- PostgreSQL database
- Real-time subscriptions
- Row Level Security (RLS)
- Automatic timestamp updates

### ✅ Other Features
- Maintenance page
- Footer credits removed (Sansekai & Yusril)
- Auth buttons in header
- Premium corporate design

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 2. Run Database Schema

1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste the content from `supabase-schema.sql`
3. Click "Run" to execute the schema

This will create:
- `users` table
- `statistics` table
- `ads` table
- `maintenance` table
- Row Level Security policies
- Triggers for auto-updating timestamps

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.sansekai.my.id/api
   NEXT_PUBLIC_CRYPTO_SECRET=Sansekai-SekaiDrama
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Get these from: Supabase Dashboard → Settings → API

### 4. Create Admin User

After setting up the database:

1. Register a new user through `/register` page
2. Go to Supabase Dashboard → Table Editor → `users` table
3. Find your user and change `role` from `user` to `admin`
4. Save changes

Now you can access `/admin` with this account!

### 5. Deploy to Vercel

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_CRYPTO_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Admin Routes

- `/admin` - Main dashboard with live statistics
- `/admin/ads` - Ads management
- `/admin/maintenance` - Maintenance mode control
- `/login` - User login
- `/register` - User registration

## Database Tables

### users
- `id` - UUID (references auth.users)
- `email` - User email
- `role` - 'user' or 'admin'
- `created_at` - Timestamp
- `updated_at` - Timestamp

### statistics
- `id` - UUID
- `total_views` - Total page views
- `total_users` - Total registered users
- `active_users` - Currently active users
- `total_dramas` - Total dramas available
- `created_at` - Timestamp
- `updated_at` - Timestamp

### ads
- `id` - UUID
- `title` - Ad title
- `image_url` - Ad image URL
- `link_url` - Ad link URL
- `position` - 'banner', 'sidebar', or 'popup'
- `is_active` - Boolean
- `created_at` - Timestamp
- `updated_at` - Timestamp

### maintenance
- `id` - UUID
- `is_active` - Boolean (maintenance mode on/off)
- `message` - Maintenance message to display
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Features Overview

### Live Statistics
- Real-time updates using Supabase Realtime
- View counts, user counts, active users
- Charts showing trends (using Recharts)
- Auto-refresh when data changes

### Ads Management
- Create ads with image, link, position
- Toggle ads active/inactive
- Edit existing ads
- Delete ads
- Preview ads before publishing

### Maintenance Mode
- Enable/disable site maintenance
- Custom maintenance message
- Live preview of maintenance page
- Admins can still access site during maintenance

### User Authentication
- Secure registration and login
- Password validation
- Session persistence
- Role-based access control
- Admin-only routes protection

## Security

- Row Level Security (RLS) enabled on all tables
- Admin-only access to management features
- Secure password hashing by Supabase Auth
- Protected API routes
- Environment variables for sensitive data

## Support

For issues or questions:
1. Check Supabase logs for database errors
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Ensure database schema is properly executed

## Notes

- First user must be manually promoted to admin in Supabase
- Statistics are updated manually (can be automated with cron jobs)
- Ads are displayed based on `is_active` status
- Maintenance mode shows special page to all non-admin users
