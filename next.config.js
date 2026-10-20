/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Temporarily disable the public /form-automation page by redirecting
      // visitors to the homepage. This preserves the page file so it can be
      // restored later by removing this rule.
      {
        source: '/form-automation',
        destination: '/',
        permanent: false,
      },
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
