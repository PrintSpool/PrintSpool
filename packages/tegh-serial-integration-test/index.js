require('babel-register')({
  ignore: /node_modules\/(?!tegh|serial-middleware)/
})
require("babel-polyfill")

// import 'tegh-driver-serial-gcode'
var teghDaemon = require('tegh-daemon').default

const argv = [null, null, './tegh.yml']

const loadPlugin = (plugin) => require(plugin)

teghDaemon(argv, loadPlugin)
