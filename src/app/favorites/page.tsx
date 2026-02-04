"use client";

import { FavoritesList } from "@/components/FavoritesList";

export default function FavoritesPage() {
  return (
    <main className="min-h-screen pt-14 pb-20">
      <div className="border-b border-border">
        <div className="container-main py-4">
          <h1 className="text-xl font-display font-bold">Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your saved dramas</p>
        </div>
      </div>
      <div className="container-main py-6">
        <FavoritesList />
      </div>
    </main>
  );
}
