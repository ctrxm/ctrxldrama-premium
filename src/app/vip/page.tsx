"use client";

import { useState } from 'react';
import { Crown, Check, Clock, Sparkles, Shield, Zap, X } from 'lucide-react';
import { useVipStatus, VIP_PLANS } from '@/hooks/useVipStatus';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

export default function VipPage() {
  const { user } = useAuth();
  const { isVip, subscription, pendingRequest, loading, requestVip } = useVipStatus();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSelectPlan = (planId: string) => {
    if (!user) return;
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    
    const result = await requestVip(selectedPlan);
    
    if (result.success) {
      setSubmitted(true);
      setShowPayment(false);
    }
    
    setSubmitting(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              VIP Membership
            </span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Nikmati pengalaman menonton tanpa batas dengan keuntungan eksklusif VIP
          </p>
        </div>

        {isVip && subscription && (
          <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-amber-400">Status VIP Aktif</h2>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paket</span>
                <span className="font-medium capitalize">{subscription.plan_type}</span>
              </div>
              {subscription.started_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mulai</span>
                  <span className="font-medium">{formatDate(subscription.started_at)}</span>
                </div>
              )}
              {subscription.expires_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Berakhir</span>
                  <span className="font-medium">{formatDate(subscription.expires_at)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {pendingRequest && (
          <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-blue-400">Menunggu Verifikasi</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Permintaan VIP kamu sedang diproses. Kami akan memverifikasi pembayaran dalam 1x24 jam.
            </p>
            <div className="text-sm">
              <span className="text-muted-foreground">Paket: </span>
              <span className="font-medium capitalize">{pendingRequest.plan_type}</span>
            </div>
          </div>
        )}

        {submitted && (
          <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Check className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-green-400">Berhasil Dikirim!</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Permintaan VIP kamu sudah diterima. Kami akan memverifikasi pembayaran dalam 1x24 jam.
            </p>
          </div>
        )}

        {!user && (
          <div className="mb-10 p-6 rounded-2xl bg-card border border-white/5 text-center">
            <p className="text-muted-foreground mb-4">Silakan login untuk berlangganan VIP</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              Login
            </Link>
          </div>
        )}

        <div className="mb-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Keuntungan VIP
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: 'Bebas Iklan', desc: 'Tonton tanpa gangguan iklan' },
              { icon: Zap, title: 'Kualitas HD', desc: 'Streaming dengan kualitas terbaik' },
              { icon: Crown, title: 'Badge VIP', desc: 'Tampil beda dengan badge eksklusif' },
              { icon: Sparkles, title: 'Priority', desc: 'Akses fitur baru lebih awal' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-card border border-white/5">
                <item.icon className="w-8 h-8 text-amber-400 mb-3" />
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {!isVip && !pendingRequest && user && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-6">Pilih Paket</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {VIP_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-2xl border transition-all cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
                      : 'bg-card border-white/5 hover:border-white/10'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-xs font-bold text-white">
                      POPULER
                    </div>
                  )}
                  <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                    <span className="text-sm text-muted-foreground">/{plan.duration}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    Pilih Paket
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showPayment && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowPayment(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold mb-4">Pembayaran</h3>

              <div className="mb-6 p-4 rounded-xl bg-white/5">
                <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
                <p className="text-2xl font-bold text-amber-400">
                  {formatPrice(VIP_PLANS.find(p => p.id === selectedPlan)?.price || 0)}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Scan QRIS untuk membayar:</p>
                <div className="relative aspect-square w-full max-w-xs mx-auto rounded-xl overflow-hidden bg-white p-2">
                  <Image
                    src="/qris-payment.jpg"
                    alt="QRIS Payment"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  CTRXL.ID, DIGITAL & KREATIF
                </p>
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <p className="font-medium">Cara Pembayaran:</p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Buka aplikasi e-wallet (GoPay, OVO, DANA, dll)</li>
                  <li>Scan QR code di atas</li>
                  <li>Masukkan jumlah sesuai paket yang dipilih</li>
                  <li>Selesaikan pembayaran</li>
                  <li>Klik tombol "Sudah Bayar" di bawah</li>
                </ol>
              </div>

              <button
                onClick={handleSubmitPayment}
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50"
              >
                {submitting ? 'Mengirim...' : 'Sudah Bayar'}
              </button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Verifikasi dilakukan dalam 1x24 jam kerja
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
