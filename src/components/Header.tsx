"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Search, X, Play, Sparkles } from "lucide-react";
import { useSearchDramas } from "@/hooks/useDramas";
import { useReelShortSearch } from "@/hooks/useReelShort";
import { useNetShortSearch } from "@/hooks/useNetShort";
import { useMeloloSearch } from "@/hooks/useMelolo";
import { useFlickReelsSearch } from "@/hooks/useFlickReels";
import { useFreeReelsSearch } from "@/hooks/useFreeReels";
import { usePlatform } from "@/hooks/usePlatform";
import { useDebounce } from "@/hooks/useDebounce";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const normalizedQuery = debouncedQuery.trim();

  // Platform context
  const { isDramaBox, isReelShort, isNetShort, isMelolo, isFlickReels, isFreeReels, platformInfo } = usePlatform();

  // Search based on platform
  const { data: dramaBoxResults, isLoading: isSearchingDramaBox } = useSearchDramas(
    isDramaBox ? normalizedQuery : ""
  );
  const { data: reelShortResults, isLoading: isSearchingReelShort } = useReelShortSearch(
    isReelShort ? normalizedQuery : ""
  );
  const { data: netShortResults, isLoading: isSearchingNetShort } = useNetShortSearch(
    isNetShort ? normalizedQuery : ""
  );
  const { data: meloloResults, isLoading: isSearchingMelolo } = useMeloloSearch(
    isMelolo ? normalizedQuery : ""
  );
  const { data: flickReelsResults, isLoading: isSearchingFlickReels } = useFlickReelsSearch(
    isFlickReels ? normalizedQuery : ""
  );
  const { data: freeReelsResults, isLoading: isSearchingFreeReels } = useFreeReelsSearch(
    isFreeReels ? normalizedQuery : ""
  );

  const isSearching = isDramaBox 
    ? isSearchingDramaBox 
    : isReelShort 
      ? isSearchingReelShort 
      : isNetShort 
        ? isSearchingNetShort
        : isMelolo
          ? isSearchingMelolo
          : isFlickReels
            ? isSearchingFlickReels
            : isSearchingFreeReels;

  // Search results processing
  const searchResults = isDramaBox 
    ? dramaBoxResults 
    : isReelShort 
      ? reelShortResults?.data 
      : isNetShort
        ? netShortResults?.data
        : isMelolo
          ? meloloResults?.data?.search_data?.flatMap((item: any) => item.books || [])
              .filter((book: any) => book.thumb_url && book.thumb_url !== "") || []
          : isFlickReels
            ? flickReelsResults?.data
            : freeReelsResults;

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  // Hide header on watch pages for immersive video experience
  if (pathname?.startsWith("/watch")) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container-corporate">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground tracking-tight">
                CTRXLDrama
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                Premium Streaming
              </span>
            </div>
          </Link>

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-all flex items-center gap-2.5"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Search dramas...
            </span>
          </button>

          {/* Auth Buttons */}
          <AuthButtons />
        </div>
      </div>

      {/* Search Overlay (Portal) */}
      {searchOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-background/98 backdrop-blur-sm z-[9999] overflow-hidden">
            <div className="container-corporate py-6 h-[100dvh] flex flex-col">
              {/* Search Header */}
              <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search in ${platformInfo.name}...`}
                    className="search-input pl-12"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSearchClose}
                  className="p-3 rounded-lg bg-secondary hover:bg-destructive/20 hover:text-destructive transition-all flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Platform indicator */}
              <div className="mb-5 flex items-center gap-2.5 text-sm">
                <span className="text-muted-foreground">Searching in:</span>
                <div className="px-3.5 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {platformInfo.name}
                </div>
              </div>

              {/* Search Results */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {isSearching && normalizedQuery && (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
                  </div>
                )}

                {!isSearching && normalizedQuery && searchResults && searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No results found</h3>
                    <p className="text-muted-foreground">Try searching with different keywords</p>
                  </div>
                )}

                {/* DramaBox Results */}
                {isDramaBox && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-3">
                    {searchResults.map((drama: any) => (
                      <Link
                        key={drama.bookId}
                        href={`/detail/dramabox/${drama.bookId}`}
                        onClick={handleSearchClose}
                        className="card-corporate p-4 flex gap-4 hover:scale-[1.01] transition-all"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={drama.cover}
                            alt={drama.bookName}
                            className="w-16 h-24 object-cover rounded-lg"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          {drama.isVip && (
                            <div className="absolute -top-1.5 -right-1.5">
                              <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base text-foreground line-clamp-1 mb-1">{drama.bookName}</h3>
                          {drama.protagonist && (
                            <p className="text-sm text-primary font-medium mb-2">{drama.protagonist}</p>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {drama.introduction}
                          </p>
                          {drama.tagNames && (
                            <div className="flex flex-wrap gap-1.5">
                              {drama.tagNames.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-secondary border border-border">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* ReelShort Results */}
                {isReelShort && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-3">
                    {searchResults.map((book: any) => (
                      <Link
                        key={book.book_id}
                        href={`/detail/reelshort/${book.book_id}`}
                        onClick={handleSearchClose}
                        className="card-corporate p-4 flex gap-4 hover:scale-[1.01] transition-all"
                      >
                        <img
                          src={book.cover_url}
                          alt={book.name}
                          className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base line-clamp-1 mb-1">{book.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {book.introduction}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{book.episode_count} episodes</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* NetShort Results */}
                {isNetShort && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-3">
                    {searchResults.map((item: any) => (
                      <Link
                        key={item.short_play_id}
                        href={`/detail/netshort/${item.short_play_id}`}
                        onClick={handleSearchClose}
                        className="card-corporate p-4 flex gap-4 hover:scale-[1.01] transition-all"
                      >
                        <img
                          src={item.cover}
                          alt={item.title}
                          className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base line-clamp-1 mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {item.introduction}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{item.total_episode} episodes</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Melolo Results */}
                {isMelolo && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-3">
                    {searchResults.map((book: any) => (
                      <Link
                        key={book.book_id}
                        href={`/detail/melolo/${book.book_id}`}
                        onClick={handleSearchClose}
                        className="card-corporate p-4 flex gap-4 hover:scale-[1.01] transition-all"
                      >
                        <img
                          src={book.thumb_url}
                          alt={book.book_name}
                          className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base line-clamp-1 mb-1">{book.book_name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {book.introduction}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{book.episode_count} episodes</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* FlickReels Results */}
                {isFlickReels && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-3">
                    {searchResults.map((book: any) => (
                      <Link
                        key={book.book_id}
                        href={`/detail/flickreels/${book.book_id}`}
                        onClick={handleSearchClose}
                        className="card-corporate p-4 flex gap-4 hover:scale-[1.01] transition-all"
                      >
                        <img
                          src={book.cover_url}
                          alt={book.name}
                          className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base line-clamp-1 mb-1">{book.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {book.introduction}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{book.episode_count} episodes</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* FreeReels Results */}
                {isFreeReels && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-3">
                    {searchResults.map((book: any) => (
                      <Link
                        key={book.bookId}
                        href={`/detail/freereels/${book.bookId}`}
                        onClick={handleSearchClose}
                        className="card-corporate p-4 flex gap-4 hover:scale-[1.01] transition-all"
                      >
                        <img
                          src={book.cover}
                          alt={book.bookName}
                          className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base line-clamp-1 mb-1">{book.bookName}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {book.introduction}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{book.episodeCount} episodes</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}

function AuthButtons() {
  const { user, isAdmin, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg border border-border hover:border-primary/50 transition-all text-sm font-medium"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <Link
          href="/admin"
          className="px-4 py-2 rounded-lg border border-primary/50 bg-primary/10 hover:bg-primary/20 transition-all text-sm font-medium flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Admin
        </Link>
      )}
      <button
        onClick={() => signOut()}
        className="px-4 py-2 rounded-lg border border-border hover:border-destructive/50 hover:text-destructive transition-all text-sm font-medium flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
