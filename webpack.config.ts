import path from 'path';
import nodeExternals from 'webpack-node-externals';

const config = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: 'node', // in case you're not setting this already
  externals: [nodeExternals()], // Add this line
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      // Remove the rule for .node files
    ],
  },
};

export default config;