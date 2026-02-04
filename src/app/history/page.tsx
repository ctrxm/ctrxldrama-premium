"use client";

import { WatchHistoryList } from "@/components/WatchHistoryList";

export default function HistoryPage() {
  return (
    <main className="min-h-screen pt-14 pb-20">
      <div className="border-b border-border">
        <div className="container-main py-4">
          <h1 className="text-xl font-display font-bold">Watch History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Continue where you left off</p>
        </div>
      </div>
      <div className="container-main py-6">
        <WatchHistoryList />
      </div>
    </main>
  );
}
