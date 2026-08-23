/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: false },
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.vercel.app" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Security headers for all routes + Vary for content negotiation
        source: "/(.*)",
        headers: [
          {
            key: "Vary",
            value: "Accept, Accept-Encoding, RSC, Next-Router-State-Tree, Next-Router-Prefetch",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // Private routes: X-Robots-Tag noindex as defense-in-depth (layout metadata also sets noindex)
        source: "/(citizen|government|login|register|reset-password)(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Vary", value: "Accept, Accept-Encoding" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "Content-Type", value: "application/xml; charset=utf-8" }],
      },
      {
        source: "/robots.txt",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
      {
        source: "/openapi.json",
        headers: [
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Vary", value: "Accept, Accept-Encoding" },
        ],
      },
      {
        source: "/.well-known/mcp",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Vary", value: "Accept, Accept-Encoding" },
        ],
      },
      {
        source: "/og-image.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async rewrites() {
    const rawApiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
    const apiUrl = rawApiUrl.replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};
export default nextConfig;
