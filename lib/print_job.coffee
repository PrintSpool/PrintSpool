fs = require("fs-extra")
path = require ("flavored-path")
SlicingEngineFactory = require("../lib/slicing_engine_factory")
EventEmitter = require('events').EventEmitter
exec = require('child_process').exec
Join = require('join')

module.exports = class PrintJob extends EventEmitter
  _defaults: (opts) =>
    qty: 1
    qtyPrinted: 0
    id: opts.printer.nextJobId()
    position: opts.printer.nextJobPosition()
    status: "idle"
    type: "job"

  constructor: (opts) ->
    # Setting the basic enumerable properties
    @[k] = v for k, v of Object.merge @_defaults(opts), opts
    # Setting up non-enumerable properties (so-called "private" properties)
    nonEnumerable =
      private: {filePath: path.resolve(@filePath)}
    Object.defineProperty k, value: v for k, v of nonEnumerable
    delete @filePath
    # Setting getters and setters for the calculated enumerable properties
    @define(k, opts[k]) for k in ["slicingEngine", "slicingProfile"]

  _define: (k, v) ->
    @private[k] = v
    descr = enumerable: true, get: @_get.fill(k), set: @_set.fill(k)
    Object.defineProperty @, k, desc

  _get: (key) =>
    @private[key] || @printer.data[key]

  _set: (key, value) =>
    @private[key] = value?.underscore?()

  key: ->
    "jobs[#{@id}]"

  loadGCode: (@private.cb = null) =>
    @once "load", @private.cb if @private.cb?
    if @needsSlicing()
      @private.slicingInstance = SlicingEngineFactory.slice @
    else
      @onSlicingComplete(gcodePath: @private.filePath)

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
    join.when @private.onLoadAndLineCount.fill new Date()

  onSlicingError: =>
    console.log "slicer error"
    @emit "job_error", "slicer error"

  _cancelledAfter: (timestamp) =>
    @private.cancelled and timestamp.isBefore @private.cancelled

  _onLoadAndLineCount: (timestamp, lineCountArgs, loadArgs) =>
    return if @private.cancelledAfter timestamp
    [err, gcode] = loadArgs

    @totalLines = parseInt(lineCountArgs[1].match(/\d+/)[0])

    if @totalLines == NaN or err?
      return @emit "job_error", "error loading gcode"

    @emit "load", err, gcode
