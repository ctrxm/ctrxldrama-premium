"use client";

import { Play, Sparkles, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on watch pages for immersive video experience
  if (pathname?.startsWith("/watch")) {
    return null;
  }

  return (
    <footer className="relative border-t border-border/30 mt-20">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-card/30" />
      
      <div className="relative container-premium py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">CTRXLDrama</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Premium Streaming
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Experience premium short drama streaming with high-quality content from multiple platforms. Watch unlimited episodes for free.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/login" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Sign In
                </Link>
              </li>
              <li>
                <Link 
                  href="/register" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Features
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Premium Quality</p>
                  <p className="text-xs text-muted-foreground">HD Streaming</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Unlimited Access</p>
                  <p className="text-xs text-muted-foreground">No Restrictions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} <span className="font-semibold">CTRXLDrama</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 font-medium">
                Premium Quality
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 font-medium">
                Free Forever
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
