//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  basePath: '/admin',
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {
    // Disable deprecated SVGR support to remove warnings
    svgr: false,
  },
  // Note: CORS is handled by middleware.ts for dynamic origin support

  // Add webpack configuration to fix chunk loading with basePath
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.publicPath = '/admin/_next/';
    }
    return config;
  },

  // Add this redirects function
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: false,
        basePath: false, // Important: bypass basePath for this redirect
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
