-- Additional schema for new features
-- Run this after the main supabase-schema.sql

-- Favorites/Watchlist table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  drama_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  drama_title TEXT NOT NULL,
  drama_cover TEXT,
  drama_genre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, drama_id, platform)
);

-- Watch History table
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  drama_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  drama_title TEXT NOT NULL,
  drama_cover TEXT,
  episode_id TEXT,
  episode_number INTEGER DEFAULT 1,
  watch_position INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, drama_id, platform, episode_id)
);

-- Ratings & Reviews table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  drama_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, drama_id, platform)
);

-- Comments table (per episode)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  drama_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  episode_id TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment Likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

-- User Subscriptions (for notifications)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  drama_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  drama_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, drama_id, platform)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_episode', 'reply', 'like', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  drama_id TEXT,
  platform TEXT,
  episode_id TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drama stats aggregation (for trending)
CREATE TABLE IF NOT EXISTS public.drama_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drama_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  drama_title TEXT NOT NULL,
  drama_cover TEXT,
  drama_genre TEXT,
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  rating_sum INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(drama_id, platform)
);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drama_stats ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Watch History policies
CREATE POLICY "Users can view their own watch history" ON public.watch_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own watch history" ON public.watch_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own watch history" ON public.watch_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watch history" ON public.watch_history
  FOR DELETE USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Anyone can view ratings" ON public.ratings
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own ratings" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON public.ratings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ratings" ON public.ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Comment Likes policies
CREATE POLICY "Anyone can view comment likes" ON public.comment_likes
  FOR SELECT USING (true);
CREATE POLICY "Users can like comments" ON public.comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike comments" ON public.comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Drama stats policies (public read)
CREATE POLICY "Anyone can view drama stats" ON public.drama_stats
  FOR SELECT USING (true);
CREATE POLICY "System can update drama stats" ON public.drama_stats
  FOR ALL USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drama_stats_updated_at BEFORE UPDATE ON public.drama_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update drama stats when rating changes
CREATE OR REPLACE FUNCTION update_drama_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.drama_stats (drama_id, platform, drama_title, rating_sum, rating_count, avg_rating)
    VALUES (NEW.drama_id, NEW.platform, '', NEW.rating, 1, NEW.rating)
    ON CONFLICT (drama_id, platform) DO UPDATE SET
      rating_sum = drama_stats.rating_sum + NEW.rating,
      rating_count = drama_stats.rating_count + 1,
      avg_rating = (drama_stats.rating_sum + NEW.rating)::decimal / (drama_stats.rating_count + 1);
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.drama_stats SET
      rating_sum = rating_sum - OLD.rating + NEW.rating,
      avg_rating = (rating_sum - OLD.rating + NEW.rating)::decimal / rating_count
    WHERE drama_id = NEW.drama_id AND platform = NEW.platform;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.drama_stats SET
      rating_sum = rating_sum - OLD.rating,
      rating_count = rating_count - 1,
      avg_rating = CASE WHEN rating_count > 1 THEN (rating_sum - OLD.rating)::decimal / (rating_count - 1) ELSE 0 END
    WHERE drama_id = OLD.drama_id AND platform = OLD.platform;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION update_drama_rating_stats();

-- Function to update favorite count in drama stats
CREATE OR REPLACE FUNCTION update_drama_favorite_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.drama_stats (drama_id, platform, drama_title, drama_cover, drama_genre, favorite_count)
    VALUES (NEW.drama_id, NEW.platform, NEW.drama_title, NEW.drama_cover, NEW.drama_genre, 1)
    ON CONFLICT (drama_id, platform) DO UPDATE SET
      favorite_count = drama_stats.favorite_count + 1,
      drama_title = COALESCE(NULLIF(NEW.drama_title, ''), drama_stats.drama_title),
      drama_cover = COALESCE(NULLIF(NEW.drama_cover, ''), drama_stats.drama_cover),
      drama_genre = COALESCE(NULLIF(NEW.drama_genre, ''), drama_stats.drama_genre);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.drama_stats SET
      favorite_count = GREATEST(favorite_count - 1, 0)
    WHERE drama_id = OLD.drama_id AND platform = OLD.platform;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_favorite_change
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION update_drama_favorite_stats();

-- Function to update view count in drama stats
CREATE OR REPLACE FUNCTION update_drama_view_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.drama_stats (drama_id, platform, drama_title, drama_cover, view_count)
  VALUES (NEW.drama_id, NEW.platform, NEW.drama_title, NEW.drama_cover, 1)
  ON CONFLICT (drama_id, platform) DO UPDATE SET
    view_count = drama_stats.view_count + 1,
    drama_title = COALESCE(NULLIF(NEW.drama_title, ''), drama_stats.drama_title),
    drama_cover = COALESCE(NULLIF(NEW.drama_cover, ''), drama_stats.drama_cover);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_watch_history_insert
  AFTER INSERT ON public.watch_history
  FOR EACH ROW EXECUTE FUNCTION update_drama_view_stats();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON public.watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_last_watched ON public.watch_history(last_watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_drama ON public.ratings(drama_id, platform);
CREATE INDEX IF NOT EXISTS idx_comments_drama ON public.comments(drama_id, platform, episode_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_drama_stats_trending ON public.drama_stats(view_count DESC, favorite_count DESC);
