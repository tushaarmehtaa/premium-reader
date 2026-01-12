/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@premium-reader/reader-ui', '@premium-reader/types'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

module.exports = nextConfig;
