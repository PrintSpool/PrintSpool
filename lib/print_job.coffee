fs = require("fs-extra")
path = require ("flavored-path")
SlicerFactory = require("../lib/slicer_factory")
EventEmitter = require('events').EventEmitter
exec = require('child_process').exec
Join = require('join')

module.exports = class PrintJob extends EventEmitter
  constructor: (opts) ->
    @[k] = v for k, v of opts

  loadGCode: (cb) =>
    @once "load", cb if cb?
    @filePath = path.resolve(@filePath)
    if @needsSlicing()
      SlicerFactory.slice @_slicerOpts()
    else
      @_onSlice(gcodePath: @filePath)

  needsSlicing: =>
    path.extname(@filePath).match(/.gcode|.ngc/)? == false

  _slicerOpts: ->
    slicingEngine: @slicingEngine
    filePath: @filePath
    printerId: @printerId
    onComplete: @_onSlice
    onError: @_onSlicerError

  _onSlice: (slicer) =>
    join = Join.create()
    @currentLine = 0

    # Getting the number of lines in the file
    exec "wc -l #{slicer.gcodePath}", join.add()
    # Loading the gcode to memory
    fs.readFile slicer.gcodePath, 'utf8', join.add()
    join.when(@_onLoadAndLineCount)

  _onSlicerError: =>
    console.log "slicer error"
    @emit "job_error", "slicer error"

  _onLoadAndLineCount: (lineCountArgs, loadArgs) =>
    [err, gcode] = loadArgs

    @totalLines = parseInt(lineCountArgs[1].match(/\d+/)[0])

    if @totalLines == NaN or err?
      return @emit "job_error", "error loading gcode"

    @emit "load", err, gcode
