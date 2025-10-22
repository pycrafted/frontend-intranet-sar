/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['backend-intranet-sar-1.onrender.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend-intranet-sar-1.onrender.com',
        port: '',
        pathname: '/media/**',
      },
    ],
  },
  // Configuration optimisée pour Vercel et Chrome
  experimental: {
    serverComponentsExternalPackages: ['@radix-ui/react-avatar'],
  },
  // Optimisations pour Chrome
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimiser les chunks pour Chrome
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  // Headers de sécurité et compatibilité Chrome
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Headers pour améliorer la compatibilité Chrome
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
