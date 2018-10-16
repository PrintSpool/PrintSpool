module.exports = {
  // babelrcRoots: __dirname,
  presets: [
    [
      '@babel/preset-env',
      // {
      //   "exclude": [
      //     "transform-regenerator",
      //     "transform-async-to-generator"
      //   ]
      // },
    ],
    '@babel/preset-react',
    '@babel/preset-flow',
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    'module:fast-async',
    // TODO: this might only be good to have in the web ui
    '@babel/plugin-transform-runtime',
  ],
  ignore: [
    'packages/*/dist/**/*.js',
  ],
}
