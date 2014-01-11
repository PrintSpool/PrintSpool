fs = require("fs-extra")
path = require ("flavored-path")
SlicingEngineFactory = require("../lib/slicing_engine_factory")
EventEmitter = require('events').EventEmitter
exec = require('child_process').exec
Join = require('join')

module.exports = class PrintJob extends EventEmitter
  constructor: (opts) ->
    @[k] = v for k, v of opts
    for k in ["slicingEngine", "slicingProfile"]
      @["_#{k}"] = @[k]
      @__defineGetter__ k, @_get.fill(k)
      @__defineSetter__ k, @_set.fill(k)
      # Object.defineProperty @, k, get: @_get.fill(k), get: @_set.fill(k)

  _get: (key) =>
    @["_#{key}"] || @printer.data[key]

  _set: (key, value) =>
    @["_#{key}"] = value?.underscore?()

  loadGCode: (@_cb = null) =>
    @once "load", @_cb if @_cb?
    @filePath = path.resolve(@filePath)
    if @needsSlicing()
      @_slicingInstance = SlicingEngineFactory.slice @
    else
      @onSlicingComplete(gcodePath: @filePath)

  cancel: =>
    @_cancelled = new Date()
    @_slicingInstance.cancel() if @_slicingInstance?
    @removeListener "load", @_cb if @_cb?
    @_slicingInstance = null
    @_cb = null

  needsSlicing: =>
    path.extname(@filePath).match(/.gcode|.ngc/i)? == false

  onSlicingComplete: (slicer) =>
    join = Join.create()
    @currentLine = 0
    @_slicingInstance = null

    # Getting the number of lines in the file
    exec "wc -l #{slicer.gcodePath}", join.add()
    # Loading the gcode to memory
    fs.readFile slicer.gcodePath, 'utf8', join.add()
    join.when @_onLoadAndLineCount.fill new Date()

  onSlicingError: =>
    console.log "slicer error"
    @emit "job_error", "slicer error"

  _cancelledAfter: (timestamp) =>
    @_cancelled and timestamp.isBefore @_cancelled

  _onLoadAndLineCount: (timestamp, lineCountArgs, loadArgs) =>
    return if @_cancelledAfter timestamp
    [err, gcode] = loadArgs

    @totalLines = parseInt(lineCountArgs[1].match(/\d+/)[0])

    if @totalLines == NaN or err?
      return @emit "job_error", "error loading gcode"

    @emit "load", err, gcode
