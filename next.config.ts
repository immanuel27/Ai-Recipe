import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
    qualities: [75],
  },
  // "Dashboard" was renamed to "Profile"
  async redirects() {
    return [
      { source: "/dashboard", destination: "/profile/overview", permanent: true },
      { source: "/dashboard/:path*", destination: "/profile/:path*", permanent: true },
    ]
  },
}

export default nextConfig
