const whitelist = /(tegh-.+|serial-middleware|graphql-live-subscriptions)\/(src|data|index)/

require('@babel/register')({
  presets: [
    '@babel/preset-env',
    '@babel/preset-flow',
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread'
  ],
  ignore: [
    (filepath) => {
      const isMatch = filepath.match(whitelist) != null
      // console.log(isMatch, filepath)
      return !isMatch
    }
  ],
})
require("@babel/polyfill")

const teghServer = require('tegh-server').default

const NODE_ENV = process.env.NODE_ENV || 'development'
const argv = [null, null, `./tegh.${NODE_ENV}.yml`]

const loadPluginPath = __dirname + '/src/loadPlugin'

teghServer(argv, loadPluginPath)
