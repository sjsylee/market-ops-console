/** @type {import('next').NextConfig} */
const imageRemoteHosts = (process.env.MARKET_IMAGE_REMOTE_HOSTS || '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const nextConfig = {
  transpilePackages: ['@market-ops/shared'],
  images: {
    remotePatterns: imageRemoteHosts.map((hostname) => ({
      protocol: 'https',
      hostname,
    })),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
