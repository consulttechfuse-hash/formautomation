/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'reply.techfuseconsult.online',
          },
        ],
        destination: 'https://techfuseconsult.online/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

// Set timezone to SAST
process.env.TZ = 'Africa/Johannesburg';
