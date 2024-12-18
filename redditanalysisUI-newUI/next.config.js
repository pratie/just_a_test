/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async redirects() {
    return [
      {
        source: '/mentions',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
