/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/webp'],
    // Only photos in the build go through the optimizer; uploads under /media/*
    // are served as is (Amplify Hosting's optimizer answers 404 for them).
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
