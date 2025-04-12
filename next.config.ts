/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nwywfckpkezcstti.public.blob.vercel-storage.com',
      },
    ],
  },
}

module.exports = nextConfig
