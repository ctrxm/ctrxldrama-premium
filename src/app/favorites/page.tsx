"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { FavoritesList } from "@/components/FavoritesList";

export default function FavoritesPage() {
  return (
    <main className="min-h-screen pb-20">
      <Header />
      <div className="container mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold mb-6">Drama Favorit</h1>
        <FavoritesList />
      </div>
      <BottomNav />
    </main>
  );
}
