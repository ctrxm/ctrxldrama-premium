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
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30">
      <div className="container-premium">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl gradient-text tracking-tight">
                CTRXLDrama
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Premium Streaming
              </span>
            </div>
          </Link>

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="relative group"
            aria-label="Search"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative px-6 py-3 rounded-xl glass-strong border border-border/50 hover:border-primary/50 transition-all duration-300 flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              <span className="hidden sm:inline text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Search dramas...
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Search Overlay (Portal) */}
      {searchOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[9999] overflow-hidden">
            <div className="container-premium py-8 h-[100dvh] flex flex-col">
              {/* Search Header */}
              <div className="flex items-center gap-4 mb-8 flex-shrink-0">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search in ${platformInfo.name}...`}
                    className="w-full pl-14 pr-6 py-4 rounded-xl glass-strong text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSearchClose}
                  className="p-4 rounded-xl glass-strong hover:bg-destructive/20 hover:text-destructive transition-all duration-300 flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Platform indicator */}
              <div className="mb-6 flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Searching in:</span>
                <div className="px-4 py-2 rounded-full glass-strong border border-primary/30 text-primary font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {platformInfo.name}
                </div>
              </div>

              {/* Search Results */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {isSearching && normalizedQuery && (
                  <div className="flex items-center justify-center py-20">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                {!isSearching && normalizedQuery && searchResults && searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full glass-strong flex items-center justify-center mb-4">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No results found</h3>
                    <p className="text-muted-foreground">Try searching with different keywords</p>
                  </div>
                )}

                {/* DramaBox Results */}
                {isDramaBox && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-4">
                    {searchResults.map((drama: any, index: number) => (
                      <Link
                        key={drama.bookId}
                        href={`/detail/dramabox/${drama.bookId}`}
                        onClick={handleSearchClose}
                        className="card-premium p-5 flex gap-5 slide-up hover:scale-[1.01] transition-all duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={drama.cover}
                            alt={drama.bookName}
                            className="w-20 h-28 object-cover rounded-lg"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          {drama.isVip && (
                            <div className="absolute -top-2 -right-2">
                              <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-1">{drama.bookName}</h3>
                          {drama.protagonist && (
                            <p className="text-sm text-primary font-medium mb-2">{drama.protagonist}</p>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {drama.introduction}
                          </p>
                          {drama.tagNames && (
                            <div className="flex flex-wrap gap-2">
                              {drama.tagNames.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="px-3 py-1 text-xs font-semibold rounded-full glass-strong border border-border/50">
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
                  <div className="grid gap-4">
                    {searchResults.map((book: any, index: number) => (
                      <Link
                        key={book.book_id}
                        href={`/detail/reelshort/${book.book_id}`}
                        onClick={handleSearchClose}
                        className="card-premium p-5 flex gap-5 slide-up hover:scale-[1.01] transition-all duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <img
                          src={book.book_pic}
                          alt={book.book_title}
                          className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-2">{book.book_title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {book.special_desc}
                          </p>
                          {book.theme && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {book.theme.slice(0, 3).map((tag: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 text-xs font-semibold rounded-full glass-strong border border-border/50">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {book.book_mark?.text && (
                            <span
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                              style={{
                                backgroundColor: book.book_mark.color || "#E52E2E",
                                color: book.book_mark.text_color || "#FFFFFF",
                              }}
                            >
                              {book.book_mark.text}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* NetShort Results */}
                {isNetShort && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-4">
                    {searchResults.map((drama: any, index: number) => (
                      <Link
                        key={drama.shortPlayId}
                        href={`/detail/netshort/${drama.shortPlayId}`}
                        onClick={handleSearchClose}
                        className="card-premium p-5 flex gap-5 slide-up hover:scale-[1.01] transition-all duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <img
                          src={drama.cover}
                          alt={drama.shortPlayName}
                          className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-2">{drama.shortPlayName}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {drama.introduction}
                          </p>
                          {drama.tagNames && (
                            <div className="flex flex-wrap gap-2">
                              {drama.tagNames.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="px-3 py-1 text-xs font-semibold rounded-full glass-strong border border-border/50">
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

                {/* Melolo Results */}
                {isMelolo && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-4">
                    {searchResults.map((book: any, index: number) => (
                      <Link
                        key={book.book_id}
                        href={`/detail/melolo/${book.book_id}`}
                        onClick={handleSearchClose}
                        className="card-premium p-5 flex gap-5 slide-up hover:scale-[1.01] transition-all duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <img
                          src={book.thumb_url}
                          alt={book.book_name}
                          className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-2">{book.book_name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {book.book_desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* FlickReels Results */}
                {isFlickReels && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-4">
                    {searchResults.map((book: any, index: number) => (
                      <Link
                        key={book.book_id}
                        href={`/detail/flickreels/${book.book_id}`}
                        onClick={handleSearchClose}
                        className="card-premium p-5 flex gap-5 slide-up hover:scale-[1.01] transition-all duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <img
                          src={book.book_pic}
                          alt={book.book_title}
                          className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-2">{book.book_title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {book.special_desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* FreeReels Results */}
                {isFreeReels && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-4">
                    {searchResults.map((drama: any, index: number) => (
                      <Link
                        key={drama.bookId}
                        href={`/detail/freereels/${drama.bookId}`}
                        onClick={handleSearchClose}
                        className="card-premium p-5 flex gap-5 slide-up hover:scale-[1.01] transition-all duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <img
                          src={drama.cover}
                          alt={drama.bookName}
                          className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-2">{drama.bookName}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {drama.introduction}
                          </p>
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
