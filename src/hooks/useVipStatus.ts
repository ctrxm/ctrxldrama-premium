"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface VipSubscription {
  id: string;
  user_id: string;
  plan_type: 'monthly' | 'yearly' | 'lifetime';
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  started_at: string | null;
  expires_at: string | null;
  payment_proof: string | null;
  payment_amount: number | null;
  created_at: string;
}

export interface VipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

export const VIP_PLANS: VipPlan[] = [
  {
    id: 'monthly',
    name: 'VIP Bulanan',
    price: 25000,
    duration: '1 Bulan',
    features: ['Bebas Iklan', 'Kualitas HD', 'Badge VIP', 'Priority Support'],
  },
  {
    id: 'yearly',
    name: 'VIP Tahunan',
    price: 199000,
    duration: '12 Bulan',
    features: ['Bebas Iklan', 'Kualitas HD', 'Badge VIP', 'Priority Support', 'Hemat 33%'],
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'VIP Selamanya',
    price: 499000,
    duration: 'Selamanya',
    features: ['Bebas Iklan', 'Kualitas HD', 'Badge VIP', 'Priority Support', 'Akses Selamanya'],
  },
];

export function useVipStatus() {
  const { user } = useAuth();
  const [isVip, setIsVip] = useState(false);
  const [subscription, setSubscription] = useState<VipSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequest, setPendingRequest] = useState<VipSubscription | null>(null);

  const checkVipStatus = useCallback(async () => {
    if (!user) {
      setIsVip(false);
      setSubscription(null);
      setPendingRequest(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vip_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        if (error.code === 'PGRST205') {
          setIsVip(false);
          setSubscription(null);
          setPendingRequest(null);
        } else {
          console.error('Error checking VIP status:', error);
        }
      } else if (data && data.length > 0) {
        const sub = data[0] as VipSubscription;
        
        if (sub.status === 'active') {
          if (sub.expires_at && new Date(sub.expires_at) < new Date()) {
            setIsVip(false);
            setSubscription(null);
          } else {
            setIsVip(true);
            setSubscription(sub);
          }
          setPendingRequest(null);
        } else if (sub.status === 'pending') {
          setIsVip(false);
          setSubscription(null);
          setPendingRequest(sub);
        } else {
          setIsVip(false);
          setSubscription(null);
          setPendingRequest(null);
        }
      } else {
        setIsVip(false);
        setSubscription(null);
        setPendingRequest(null);
      }
    } catch (err) {
      console.error('Error checking VIP status:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkVipStatus();
  }, [checkVipStatus]);

  const requestVip = useCallback(async (planType: string, paymentProof?: string) => {
    if (!user) return { success: false, error: 'Please sign in first' };

    const plan = VIP_PLANS.find(p => p.id === planType);
    if (!plan) return { success: false, error: 'Invalid plan' };

    try {
      const { error } = await supabase
        .from('vip_subscriptions')
        .insert({
          user_id: user.id,
          plan_type: planType,
          status: 'pending',
          payment_amount: plan.price,
          payment_proof: paymentProof || null,
        });

      if (error) {
        if (error.code === 'PGRST205') {
          return { success: false, error: 'VIP feature is being set up. Please try again later.' };
        }
        throw error;
      }

      await checkVipStatus();
      return { success: true };
    } catch (err) {
      console.error('Error requesting VIP:', err);
      return { success: false, error: 'Failed to submit request' };
    }
  }, [user, checkVipStatus]);

  return {
    isVip,
    subscription,
    pendingRequest,
    loading,
    plans: VIP_PLANS,
    requestVip,
    refresh: checkVipStatus,
  };
}
