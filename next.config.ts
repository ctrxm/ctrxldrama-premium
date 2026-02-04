import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['https://*.replit.dev', 'https://*.replit.app', 'https://*.spock.replit.dev', 'https://*.riker.replit.dev', 'https://*.picard.replit.dev', 'https://*.kirk.replit.dev', 'https://*.janeway.replit.dev'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgcdnmi.dramaboxdb.com",
      },
      {
        protocol: "https",
        hostname: "hwztchapter.dramaboxdb.com",
      },
      {
        protocol: "https",
        hostname: "awscover.netshort.com",
      },
      {
        protocol: "https",
        hostname: "static.netshort.com",
      },
      {
        protocol: "https",
        hostname: "cover.netshort.com",
      },
      {
        protocol: "https",
        hostname: "alicdn.netshort.com",
      },
      {
        protocol: "https",
        hostname: "zshipubcdn.farsunpteltd.com",
      },
      {
        protocol: "https",
        hostname: "zshipricf.farsunpteltd.com",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
