export interface Favorite {
  id: string;
  user_id: string;
  drama_id: string;
  platform: string;
  drama_title: string;
  drama_cover: string | null;
  drama_genre: string | null;
  created_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  drama_id: string;
  platform: string;
  drama_title: string;
  drama_cover: string | null;
  episode_id: string | null;
  episode_number: number;
  watch_position: number;
  duration: number;
  last_watched_at: string;
  created_at: string;
}

export interface Rating {
  id: string;
  user_id: string;
  drama_id: string;
  platform: string;
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

export interface Comment {
  id: string;
  user_id: string;
  drama_id: string;
  platform: string;
  episode_id: string | null;
  content: string;
  parent_id: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user_email?: string;
  replies?: Comment[];
  is_liked?: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  drama_id: string;
  platform: string;
  drama_title: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_episode' | 'reply' | 'like' | 'system';
  title: string;
  message: string;
  drama_id: string | null;
  platform: string | null;
  episode_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DramaStats {
  id: string;
  drama_id: string;
  platform: string;
  drama_title: string;
  drama_cover: string | null;
  drama_genre: string | null;
  view_count: number;
  favorite_count: number;
  rating_sum: number;
  rating_count: number;
  avg_rating: number;
  updated_at: string;
}

export interface FilterOptions {
  genre?: string;
  year?: string;
  minRating?: number;
  sortBy?: 'popular' | 'newest' | 'rating' | 'views';
}
