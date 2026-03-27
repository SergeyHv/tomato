/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '29idrg4kalgzmepn.public.blob.vercel-storage.com',
      },
    ],
  },
};

module.exports = nextConfig;
