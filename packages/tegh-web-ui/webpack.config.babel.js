import HtmlWebPackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'

module.exports = {
  entry: {
    app: './src/index.js'
  },
  devServer: {
    contentBase: './dist',
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
}
