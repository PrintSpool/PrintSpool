fs = require("fs-extra")
path = require ("flavored-path")
SlicerFactory = require("../lib/slicer_factory")

module.exports = class PrintJob
  constructor: (opts) ->
    @[k] = v for k, v of opts

  loadGCode: (cb) =>
    @file_path = path.resolve(@file_path)
    if path.extname(@file_path).match(/.gcode|.ngc/)?
      @_onSlice(gcode_path: @file_path)
    else
      SlicerFactory.slice @_slicerOpts()

  _slicerOpts: ->
    engine: "cura"
    file_path: path.resolve(@file_path)
    onComplete: @_onSlice

  _onSlice: (slicer) =>
    console.log slicer.gcode_path
    fs.readFile slicer.gcode_path, 'utf8', @_onLoad.fill cb

  _onLoad: (cb, err, gcode) =>
    @totalLines = 0
    @totalLines += 1 if c == '\n' for c in gcode
    @currentLine = 0
    cb err, gcode
