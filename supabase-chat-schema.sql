-- Chat Messages Table for Community Chat Feature
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read chat messages
CREATE POLICY "Anyone can read chat messages" ON chat_messages
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert their own messages
CREATE POLICY "Authenticated users can insert chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
