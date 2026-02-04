"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/watch")) {
    return null;
  }

  return (
    <footer className="border-t border-border mt-16 mb-16 md:mb-0">
      <div className="container-main py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-display font-bold tracking-tight">CTRXL</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary px-2 py-0.5 border border-primary">
                Drama
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Premium short drama streaming platform. Watch unlimited episodes from multiple sources in high quality.
            </p>
          </div>

          <div>
            <h4 className="text-label mb-3">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Browse
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Library
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-label mb-3">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CTRXL Drama. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="badge-count">HD Quality</span>
            <span className="badge-count">Free Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
