"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/watch")) {
    return null;
  }

  return (
    <footer className="mt-20 mb-24 md:mb-0">
      <div className="container-main">
        <div className="glass-card p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="CTRXL Drama"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground">CTRXL Drama</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Platform streaming drama pendek premium. Tonton episode unlimited dari berbagai sumber dalam kualitas tinggi.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Navigasi</h4>
              <ul className="space-y-3">
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
              <h4 className="text-sm font-semibold text-foreground mb-4">Akun</h4>
              <ul className="space-y-3">
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
            <div className="flex items-center gap-3">
              <span className="badge-count">HD Quality</span>
              <span className="badge-count">Free Access</span>
              <span className="badge-count">No Ads</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
