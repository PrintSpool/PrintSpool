fs = require("fs-extra")
path = require ("flavored-path")
SlicingEngineFactory = require("../lib/slicing_engine_factory")
EventEmitter = require('events').EventEmitter
exec = require('child_process').exec
Join = require('join')

module.exports = class PrintJob extends EventEmitter
  constructor: (printer, opts) ->
    # Setting the basic enumerable properties
    @[k] = v for k, v of Object.merge @_defaults(opts), opts
    # Setting up non-enumerable properties (so-called "private" properties)
    Object.defineProperty @, 'private', value: filePath: path.resolve(@filePath)
    Object.defineProperty @, 'printer', value: printer
    delete @filePath
    # Setting getters and setters for the calculated enumerable properties
    @_define(k, opts[k]) for k in ["slicingEngine", "slicingProfile"]

  _defaults: (opts) =>
    qty: 1
    qtyPrinted: 0
    status: "idle"
    type: "job"

  _define: (k, v) ->
    @private[k] = v
    desc = enumerable: true, get: @_get.fill(k), set: @_set.fill(k)
    Object.defineProperty @, k, desc

  _get: (key) =>
    @private[key] || @printer.data[key]

  _set: (key, value) =>
    @private[key] = value?.underscore?()

  key: ->
    "jobs[#{@id}]"

  loadGCode: (cb = null) =>
    @private.cb = cb
    @once "load", cb if cb?
    if @needsSlicing()
      @private.slicingInstance = SlicingEngineFactory.slice @
    else
      setTimeout (=> @onSlicingComplete gcodePath: @private.filePath), 0

  cancel: =>
    @private.cancelled = new Date()
    @private.slicingInstance.cancel() if @private.slicingInstance?
    @removeListener "load", @private.cb if @private.cb?
    @private.slicingInstance = null
    @private.cb = null

  needsSlicing: =>
    path.extname(@private.filePath).match(/.gcode|.ngc/i)? == false

  onSlicingComplete: (slicer) =>
    join = Join.create()
    @currentLine = 0
    @private.slicingInstance = null

    # Getting the number of lines in the file
    exec "wc -l #{slicer.gcodePath}", join.add()
    # Loading the gcode to memory
    fs.readFile slicer.gcodePath, 'utf8', join.add()
    join.when @_onLoadAndLineCount.fill new Date()

  onSlicingError: =>
    console.log "slicer error"
    @emit "job_error", "slicer error"

  _cancelledAfter: (timestamp) =>
    @private.cancelled and timestamp.isBefore @private.cancelled

  _onLoadAndLineCount: (timestamp, lineCountArgs, loadArgs) =>
    return if @_cancelledAfter timestamp
    [err, gcode] = loadArgs

    @totalLines = parseInt(lineCountArgs[1].match(/\d+/)[0])

    if @totalLines == NaN or err?
      return @emit "job_error", "error loading gcode"

    @emit "load", err, gcode
