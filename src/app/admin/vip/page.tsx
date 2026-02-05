"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Crown, Check, X, ArrowLeft, RefreshCw, Clock, User, Calendar, CreditCard } from 'lucide-react';

interface VipRequest {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  payment_proof: string | null;
  payment_amount: number | null;
  created_at: string;
  started_at: string | null;
  expires_at: string | null;
  user_email?: string;
  user_name?: string;
}

const planLabels: Record<string, string> = {
  monthly: 'Bulanan (1 Bulan)',
  yearly: 'Tahunan (12 Bulan)',
  lifetime: 'Selamanya',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminVipPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<VipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'expired'>('pending');
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      }
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();

      const channel = supabase
        .channel('vip-requests-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'vip_subscriptions' },
          () => {
            fetchRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('vip_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch VIP subscriptions:', error);
        setLoading(false);
        return;
      }

      const requestsWithUsers = await Promise.all(
        (data || []).map(async (req) => {
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('email, name')
              .eq('id', req.user_id)
              .single();
            
            return {
              ...req,
              user_email: userData?.email || req.user_id,
              user_name: userData?.name || 'User',
            };
          } catch {
            return {
              ...req,
              user_email: req.user_id,
              user_name: 'User',
            };
          }
        })
      );

      setRequests(requestsWithUsers);
    } catch (error) {
      console.error('Error fetching VIP requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const handleApprove = async (request: VipRequest) => {
    if (!confirm(`Approve VIP ${planLabels[request.plan_type]} for ${request.user_email}?`)) return;
    
    setActionLoading(request.id);
    try {
      const now = new Date();
      let expiresAt: Date | null = null;

      if (request.plan_type === 'monthly') {
        expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (request.plan_type === 'yearly') {
        expiresAt = new Date(now);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      const { error } = await supabase
        .from('vip_subscriptions')
        .update({
          status: 'active',
          started_at: now.toISOString(),
          expires_at: expiresAt?.toISOString() || null,
          approved_by: user?.id,
          approved_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', request.id);

      if (error) throw error;
      await fetchRequests();
    } catch (error) {
      console.error('Error approving VIP:', error);
      alert('Failed to approve VIP subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request: VipRequest) => {
    const reason = prompt('Alasan penolakan (opsional):');
    if (reason === null) return;

    setActionLoading(request.id);
    try {
      const { error } = await supabase
        .from('vip_subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (error) throw error;
      await fetchRequests();
    } catch (error) {
      console.error('Error rejecting VIP:', error);
      alert('Failed to reject VIP subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (request: VipRequest) => {
    if (!confirm(`Revoke VIP status from ${request.user_email}?`)) return;
    
    setActionLoading(request.id);
    try {
      const { error } = await supabase
        .from('vip_subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (error) throw error;
      await fetchRequests();
    } catch (error) {
      console.error('Error revoking VIP:', error);
      alert('Failed to revoke VIP subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const activeCount = requests.filter(r => r.status === 'active').length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-3 md:px-4 pb-6 md:pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">VIP Management</h1>
                <p className="text-sm text-muted-foreground">Kelola langganan VIP member</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="card-corporate p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
          </div>
          <div className="card-corporate p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-green-400" />
              <span className="text-sm text-muted-foreground">Active VIP</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
          </div>
          <div className="card-corporate p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Requests</span>
            </div>
            <p className="text-2xl font-bold">{requests.length}</p>
          </div>
          <div className="card-corporate p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              Rp {requests
                .filter(r => r.status === 'active')
                .reduce((sum, r) => sum + (r.payment_amount || 0), 0)
                .toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['pending', 'active', 'expired', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-card hover:bg-card/80 text-muted-foreground'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'pending' ? 'Pending' : f === 'active' ? 'Active' : 'Expired'}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-yellow-500 text-white text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="card-corporate p-12 text-center">
              <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filter === 'pending' ? 'Tidak ada request pending' : 'Tidak ada data'}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="card-corporate p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {request.user_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{request.user_name}</p>
                        <p className="text-sm text-muted-foreground">{request.user_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[request.status]}`}>
                        {request.status.toUpperCase()}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                        {planLabels[request.plan_type]}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(request.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {request.payment_amount && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Amount: <span className="text-foreground font-medium">Rp {request.payment_amount.toLocaleString('id-ID')}</span>
                      </p>
                    )}

                    {request.status === 'active' && request.expires_at && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Expires: <span className="text-foreground">{new Date(request.expires_at).toLocaleDateString('id-ID')}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {request.payment_proof && (
                      <button
                        onClick={() => setSelectedProof(request.payment_proof)}
                        className="btn-secondary text-sm"
                      >
                        Lihat Bukti
                      </button>
                    )}

                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={actionLoading === request.id}
                          className="btn-primary gap-1.5 text-sm bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          disabled={actionLoading === request.id}
                          className="btn-secondary gap-1.5 text-sm text-red-400 border-red-500/30 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {request.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(request)}
                        disabled={actionLoading === request.id}
                        className="btn-secondary gap-1.5 text-sm text-red-400 border-red-500/30 hover:bg-red-500/10"
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedProof && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProof(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[80vh] overflow-auto">
            <button
              onClick={() => setSelectedProof(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedProof}
              alt="Payment Proof"
              className="w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
