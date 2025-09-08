/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['placehold.co'],
  },
  // ✅ Transpile undici so webpack can handle private fields
  transpilePackages: ['undici'],
};

module.exports = nextConfig;
