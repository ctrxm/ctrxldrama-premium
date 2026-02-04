"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Layers, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

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
      href: "/browse",
      icon: Compass,
      label: "Browse",
      active: pathname === "/browse",
    },
    {
      href: "/favorites",
      icon: Layers,
      label: "Library",
      active: pathname === "/favorites" || pathname === "/bookmarks",
    },
    {
      href: user ? "/profile" : "/login",
      icon: User,
      label: user ? "Account" : "Sign In",
      active: pathname === "/profile" || pathname === "/login",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden safe-bottom">
      <div className="flex items-stretch h-14">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative ${
                item.active
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary" />
              )}
              <Icon className="w-5 h-5" strokeWidth={item.active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
