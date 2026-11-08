import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The dev badge sits on top of the dock; errors still show their overlay
  devIndicators: false,
  images: {
    // Serve images as they are. Vercel's optimiser is metered (Hobby ran out on 2026-11-07
    // and answered 402, so new website previews and logos showed as broken images), and
    // uploads are already downscaled to ≤1080px JPEGs in the browser (lib/media.ts).
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Country flags in the seller setup
      { protocol: "https", hostname: "flagcdn.com" },
      // Creators' uploads (covers, photos, website previews) in Supabase Storage
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    qualities: [75],
  },
  // "Dashboard" was renamed to "Profile"
  async redirects() {
    return [
      // Browsers request /favicon.ico on their own; the real icon is generated at /icon/32
      { source: "/favicon.ico", destination: "/icon/32", permanent: true },
      { source: "/dashboard", destination: "/profile/overview", permanent: true },
      { source: "/dashboard/:path*", destination: "/profile/:path*", permanent: true },
    ]
  },
}

export default nextConfig
