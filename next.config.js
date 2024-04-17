const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Replace with your Django server's URL
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs`, `net`, `tls`, `dns` etc.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // Add rule to handle .node files using raw-loader
    config.module.rules.push({
      test: /\.node$/,
      use: 'raw-loader',
    });

    return config;
  },
};
