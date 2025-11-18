/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow importing from outside the app directory (for monorepo)
  transpilePackages: ['@chatcard/proof'],
  // Webpack config to handle monorepo imports
  webpack: (config, { isServer }) => {
    // Allow importing from parent directories
    config.resolve.symlinks = false;

    // Add alias for easier imports
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }

    return config;
  },
}

module.exports = nextConfig

