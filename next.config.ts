import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The dev badge sits on top of the dock; errors still show their overlay
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Country flags in the seller setup
      { protocol: "https", hostname: "flagcdn.com" },
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
