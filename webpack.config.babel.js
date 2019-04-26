import path from 'path'
import HtmlWebPackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
// import nodeExternals from 'webpack-node-externals'
import babelConfig from './.babelrc'

const babelLoaderRules = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: babelConfig,
    },
  },
  // {
  //   test: /\.js$/,
  //   include: /node_modules/,
  //   use: {
  //     loader: 'babel-loader',
  //     options: babelConfig,
  //   },
  // },
]

const frontend = {
  entry: {
    app: './packages/tegh-web-ui/src/index.js',
  },
  output: {
    path: path.resolve(
      __dirname,
      'packages/tegh-web-ui/dist/',
    ),
    filename: 'tegh-web-ui.js',
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
      ...babelLoaderRules,
      // {
      //   test: /\.svg$/,
      //   loader: 'svg-inline-loader',
      // },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(svg|jpe?g|png|ttf|eot|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        use: 'base64-inline-loader?limit=1000&name=[name].[ext]',
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
    // new webpack.HotModuleReplacementPlugin(),
  ],
}

// // && cd ./snap/bin/ && chmod 755 ./tegh && echo \"#!/usr/bin/env node\n$(cat ./tegh)\" > ./tegh
// const backend = {
//   target: 'node',
//   externals: {
//     // 'any-promise': { commonjs: 'bluebird' },
//     // // /* libraries installed by snapcraft */
//     // serialport: { commonjs: 'serialport' },
//     // wrtc: { commonjs: 'serialport' },
//     // ws: { commonjs: 'serialport' },
//     // '@trust/webcrypto': { commonjs: 'serialport' },
//     // graphql: { commonjs: 'serialport' },
//     // 'redux-loop': { commonjs: 'serialport' },
//     // /* unused optional dependencies */
//     // fsevents: { commonjs: 'serialport' },
//     // 'node-webcrypto-ossl': { commonjs: 'serialport' },
//   },
//   entry: {
//     backend: './packages/tegh-host-posix/src/index.js',
//   },
//   output: {
//     path: path.resolve(
//       __dirname,
//       'snap/bin/',
//     ),
//     filename: 'tegh',
//   },
//   module: {
//     rules: [
//       ...babelLoaderRules,
//     ],
//   },
//   optimization: {
//     minimize: false,
//   },
// }

// module.exports = [frontend, backend]
module.exports = [frontend]
