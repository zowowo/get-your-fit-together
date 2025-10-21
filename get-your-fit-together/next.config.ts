/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
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
