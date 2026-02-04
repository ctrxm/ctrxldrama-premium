"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { WatchHistoryList } from "@/components/WatchHistoryList";

export default function HistoryPage() {
  return (
    <main className="min-h-screen pb-20">
      <Header />
      <div className="container mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold mb-6">Riwayat Tontonan</h1>
        <WatchHistoryList />
      </div>
      <BottomNav />
    </main>
  );
}
