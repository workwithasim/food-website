/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@restaurant/ui",
    "@restaurant/contracts",
    "@restaurant/api-client",
    "@restaurant/auth-client"
  ]
};

export default nextConfig;
