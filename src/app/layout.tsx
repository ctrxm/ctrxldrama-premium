import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { AdsDisplay } from "@/components/AdsDisplay";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "CTRXL DRAMA - Streaming Drama Pendek",
  description: "Nonton drama pendek gratis dan tanpa iklan di CTRXL DRAMA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <Suspense fallback={<div className="h-16" />}>
            <Header />
          </Suspense>
          <div className="pb-16 md:pb-0">
            {children}
          </div>
          <Footer />
          <BottomNav />
          <AdsDisplay position="popup" />
          <AdsDisplay position="bottom" />
          <Toaster />
          <Sonner />
        </Providers>
      </body>
    </html>
  );
}
