"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, User, Film } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show bottom nav on admin pages or watch pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/watch')) {
    return null;
  }

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/search",
      icon: Search,
      label: "Search",
      active: pathname === "/search",
    },
    {
      href: "/browse",
      icon: Film,
      label: "Browse",
      active: pathname === "/browse",
    },
    {
      href: "/bookmarks",
      icon: Bookmark,
      label: "Bookmarks",
      active: pathname === "/bookmarks",
    },
    {
      href: user ? "/profile" : "/login",
      icon: User,
      label: user ? "Profile" : "Login",
      active: pathname === "/profile" || pathname === "/login",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                item.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
