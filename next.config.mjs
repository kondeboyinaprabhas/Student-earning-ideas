/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['firebase-admin'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '**.firebasestorage.app' },
      { protocol: 'https', hostname: '**.imgto.link' },
      { protocol: 'https', hostname: 'user40001.na.imgto.link' },
      { protocol: 'https', hostname: 'img.sanishtech.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Permanent redirect from legacy privacy-policy URL to canonical /privacy page
  async redirects() {
    return [
      {
        source: '/privacy-policy',
        destination: '/privacy',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
