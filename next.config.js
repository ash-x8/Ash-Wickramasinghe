/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '*.firebasestorage.app' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.vercel.app' }
    ]
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  headers: async () => [{
    source: '/api/:path*',
    headers: [{ key: 'Cache-Control', value: 'no-store' }]
  }]
};
module.exports = nextConfig;
