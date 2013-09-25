fs = require("fs-extra")

module.exports = class PrintJob
  constructor: (opts) ->
    @[k] = v for k, v of opts

  loadGCode: (cb) =>
    fs.readFile @gcode, 'utf8', cb
