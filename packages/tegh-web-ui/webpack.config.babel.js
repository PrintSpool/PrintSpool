import path from 'path'
import HtmlWebPackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'

module.exports = {
  entry: {
    app: './src/index.js',
  },
  devServer: {
    contentBase: './dist',
    hot: true,
  },
  resolve: {
    alias: {
      'apollo-react-live-subscriptions': path.resolve(__dirname, 'src/util/LiveSubscription'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
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
      template: './src/index.html',
      filename: './index.html',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
}
