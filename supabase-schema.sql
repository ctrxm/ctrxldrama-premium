-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Statistics table
CREATE TABLE IF NOT EXISTS public.statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  total_views BIGINT DEFAULT 0,
  total_users BIGINT DEFAULT 0,
  active_users BIGINT DEFAULT 0,
  total_dramas BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads table
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('banner', 'sidebar', 'popup')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance table
CREATE TABLE IF NOT EXISTS public.maintenance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  is_active BOOLEAN DEFAULT false,
  message TEXT NOT NULL DEFAULT 'Site is under maintenance. Please check back later.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial statistics record
INSERT INTO public.statistics (total_views, total_users, active_users, total_dramas)
VALUES (0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- Insert initial maintenance record
INSERT INTO public.maintenance (is_active, message)
VALUES (false, 'Site is under maintenance. Please check back later.')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
  DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
  DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
  DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
  DROP POLICY IF EXISTS "Anyone can view statistics" ON public.statistics;
  DROP POLICY IF EXISTS "Admins can update statistics" ON public.statistics;
  DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ads;
  DROP POLICY IF EXISTS "Admins can manage ads" ON public.ads;
  DROP POLICY IF EXISTS "Anyone can view maintenance status" ON public.maintenance;
  DROP POLICY IF EXISTS "Admins can update maintenance" ON public.maintenance;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Users policies (simplified to avoid infinite recursion)
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Statistics policies (public read, admin write)
CREATE POLICY "Anyone can view statistics" ON public.statistics
  FOR SELECT USING (true);

CREATE POLICY "Admins can update statistics" ON public.statistics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ads policies (public read, admin write)
CREATE POLICY "Anyone can view active ads" ON public.ads
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage ads" ON public.ads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Maintenance policies
CREATE POLICY "Anyone can view maintenance status" ON public.maintenance
  FOR SELECT USING (true);

CREATE POLICY "Admins can update maintenance" ON public.maintenance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_statistics_updated_at ON public.statistics;
DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
DROP TRIGGER IF EXISTS update_maintenance_updated_at ON public.maintenance;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statistics_updated_at BEFORE UPDATE ON public.statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON public.maintenance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
