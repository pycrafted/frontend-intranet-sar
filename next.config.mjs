/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorer les erreurs de Google Fonts pendant le build
  experimental: {
    serverComponentsExternalPackages: ['@radix-ui/react-avatar'],
  },
  // Configuration pour autoriser les origines de développement
  allowedDevOrigins: [
    'http://sar-intranet',
    'http://sar-intranet.sar.sn',
    'http://sar-intranet:3000',
    'http://sar-intranet.sar.sn:3000',
  ],
  images: {
    unoptimized: true,
    domains: ['backend-intranet-sar-1.onrender.com', 'sar-intranet.sar.sn'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend-intranet-sar-1.onrender.com',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'sar-intranet.sar.sn',
        port: '8000',
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
    const isDev = process.env.NODE_ENV === 'development'
    
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
          // Headers de cache adaptés à l'environnement
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'public, max-age=0, must-revalidate' 
              : 'public, max-age=3600, must-revalidate',
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
            value: isDev 
              ? 'public, max-age=0, must-revalidate' 
              : 'public, max-age=86400, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
