require('babel-register')({
  ignore: /node_modules\/(?!tegh|serial-middleware)/
})
require("babel-polyfill")

// import 'tegh-driver-serial-gcode'
var teghDaemon = require('tegh-daemon').default

const NODE_ENV = process.env.NODE_ENV || 'development'
const argv = [null, null, `./tegh.${NODE_ENV}.yml`]

const loadPlugin = (plugin) => require(plugin)

teghDaemon(argv, loadPlugin)
