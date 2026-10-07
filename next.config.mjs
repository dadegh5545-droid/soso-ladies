/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/webp'],
    // Media keys never change (a new upload gets a new key), so optimized
    // copies can be kept for an hour.
    minimumCacheTTL: 3600,
  },
  async rewrites() {
    // Stable public URLs for stored media: /media/gallery/<file> -> pages/api/media.
    return [{ source: '/media/:path*', destination: '/api/media/:path*' }];
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
