/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  async rewrites() {
    return {
      fallback: [
        {
          source: '/:path*',
          destination: '/_not-found',
        },
      ],
    }
  },
}
