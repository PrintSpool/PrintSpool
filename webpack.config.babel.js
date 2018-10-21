import path from 'path'
import HtmlWebPackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import babelConfig from './.babelrc'

module.exports = {
  entry: {
    app: './packages/tegh-web-ui/src/index.js',
  },
  devServer: {
    contentBase: './packages/tegh-web-ui/dist',
    hot: false,
  },
  resolve: {
    modules: [
      'packages/tegh-web-ui/node_modules',
      'node_modules',
    ],
    alias: {
      'apollo-react-live-subscriptions': path.resolve(
        __dirname,
        'packages/tegh-web-ui/src/util/LiveSubscription',
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelConfig,
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './packages/tegh-web-ui/src/index.html',
      filename: './index.html',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
}
