//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // basePath clearly indicates this is a services provider, not the admin UI
  basePath: '/services',
  transpilePackages: ['next-auth'],
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {
    // Disable deprecated SVGR support to remove warnings
    svgr: false,
  },
  // Note: CORS is handled by middleware.ts for dynamic origin support
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
