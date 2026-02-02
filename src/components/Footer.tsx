"use client";

import { ExternalLink, Play, Sparkles } from "lucide-react";
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
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/50" />
      
      <div className="relative container-premium py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl gradient-text">CTRXLDrama</h3>
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
                <a 
                  href="https://api.sansekai.my.id" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  API Documentation
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Powered By */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Powered By
            </h4>
            <div className="glass-strong p-4 rounded-xl border border-border/50">
              <a 
                href="https://api.sansekai.my.id" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SΛ</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      SΛNSΞKΛI API
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      Premium API Service
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  High-performance API providing access to multiple drama platforms
                </p>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} <span className="font-semibold">CTRXLDrama</span>. All rights reserved. Made with <span className="text-red-500">❤️</span> by <span className="font-semibold text-primary">Yusril</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="px-3 py-1 rounded-full glass-strong border border-border/50 font-medium">
                Premium Quality
              </span>
              <span className="px-3 py-1 rounded-full glass-strong border border-border/50 font-medium">
                Free Forever
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
