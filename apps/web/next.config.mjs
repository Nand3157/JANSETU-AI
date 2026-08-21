/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: false },
  images: { remotePatterns: [{ hostname: "**" }] }
};
export default nextConfig;
