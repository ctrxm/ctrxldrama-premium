"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Layers, User, Crown } from "lucide-react";
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
      href: "/chat",
      icon: MessageCircle,
      label: "Chat",
      active: pathname === "/chat",
    },
    {
      href: "/vip",
      icon: Crown,
      label: "VIP",
      active: pathname === "/vip",
      isVip: true,
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
      <div className="mx-3 mb-3">
        <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-white/5 shadow-lg shadow-black/20">
          <div className="flex items-stretch h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all relative ${
                    item.active
                      ? "text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-all ${
                    item.active 
                      ? (item as any).isVip
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30"
                        : "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
                      : ""
                  }`}>
                    <Icon className={`w-5 h-5 ${(item as any).isVip && !item.active ? 'text-amber-400' : ''}`} strokeWidth={item.active ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-medium ${item.active ? 'text-white' : (item as any).isVip ? 'text-amber-400' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
