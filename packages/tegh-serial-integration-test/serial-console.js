require('babel-register')({
  ignore: /node_modules\/(?!tegh|serial-middleware)/
})
require("babel-polyfill")

var serialConsole = require('tegh-driver-serial-gcode').serialConsole

serialConsole()
