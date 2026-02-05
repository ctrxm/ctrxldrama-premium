-- VIP Subscription System for CTRXL Drama
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- VIP Subscriptions table
CREATE TABLE IF NOT EXISTS vip_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly', 'lifetime'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'expired', 'cancelled'
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  payment_proof TEXT, -- URL to payment proof image
  payment_amount INTEGER, -- Amount in IDR
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_user_id ON vip_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_status ON vip_subscriptions(status);

-- Enable Row Level Security
ALTER TABLE vip_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions" ON vip_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscription requests
CREATE POLICY "Users can create subscription requests" ON vip_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to check if current user is admin (if not already created)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Admins can read all subscriptions (for approval)
CREATE POLICY "Admins can read all subscriptions" ON vip_subscriptions
  FOR SELECT USING (public.is_admin());

-- Policy: Admins can update subscriptions (for approval)
CREATE POLICY "Admins can update subscriptions" ON vip_subscriptions
  FOR UPDATE USING (public.is_admin());

-- Function to check if user is VIP
CREATE OR REPLACE FUNCTION is_user_vip(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vip_subscriptions 
    WHERE user_id = check_user_id 
    AND status = 'active' 
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE vip_subscriptions;
