/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Paused or retired pages. Bundles may come back; the rest are gone for good.
  async redirects() {
    return [
      { source: "/bundles", destination: "/", permanent: false },
      { source: "/bundles/:path*", destination: "/", permanent: false },
      { source: "/search", destination: "/notifications", permanent: true },
      { source: "/resources", destination: "/exams", permanent: true },
      { source: "/feedback", destination: "/contact", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
