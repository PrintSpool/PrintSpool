fs = require("fs-extra")

module.exports = class PrintJob
  constructor: (opts) ->
    @[k] = v for k, v of opts

  loadGCode: (cb) =>
    fs.readFile @gcode, 'utf8', @_onLoad.fill cb

  _onLoad: (cb, err, gcode) =>
    @totalLines = 0
    @totalLines += 1 if c == '\n' for c in gcode
    @currentLine = 0
    cb err, gcode
