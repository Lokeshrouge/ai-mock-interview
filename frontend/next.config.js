/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['axios', 'lucide-react'],
  // Fix Windows/OneDrive filesystem issues
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  // Disable file system cache that can cause issues on OneDrive
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;
