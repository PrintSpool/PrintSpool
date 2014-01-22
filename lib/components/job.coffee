fs = require("fs-extra")
path = require ("flavored-path")
SlicingEngineFactory = require path.join __dirname, "../slicing_engine_factory"
EventEmitter = require('events').EventEmitter
exec = require('child_process').exec
Join = require('join')
nodeUUID = require('node-uuid')

module.exports = class PrintJob extends EventEmitter
  constructor: (opts, cb) ->
    # Setting the basic enumerable properties
    @[k] = v for k, v of Object.merge @_defaults(opts), opts
    # Setting up non-enumerable properties (so-called "private" properties)
    Object.defineProperty @, 'private', value: filePath: path.resolve(@filePath)
    Object.defineProperty @, 'key', value: nodeUUID.v4().replace(/-/g, "")
    delete @filePath
    setTimeout cb, 0

  _defaults: (opts) =>
    qty: 1
    qtyPrinted: 0
    status: "idle"
    type: "job"
    assemblyId: null
    quality: "normal" # draft | normal | high

  components: ->
    [@]

  beforeDelete: ->
    @cancel()
    @removeAllListeners()
    fs.remove @filePath, @_deletionError
    @_deleteGCodeFile()

  _deleteGCodeFile: ->
    fs.remove @private.gcodePath, @_deletionError if @private.gcodePath?
    delete @private.gcodePath

  _deletionErr: (err) ->
    console.log err.trace?() || err if err?

  cancel: =>
    @private.cancelled = new Date()
    @private.slicingInstance.cancel() if @private.slicingInstance?
    @removeListener "load", @private.cb if @private.cb?
    @private.slicingInstance = null
    @private.cb = null

  _cancelledAfter: (timestamp) =>
    @private.cancelled and timestamp.isBefore @private.cancelled

  needsSlicing: =>
    path.extname(@private.filePath).match(/.gcode|.ngc/i)? == false

  loadGCode: (slicerConfig, cb = null) =>
    @private.cb = cb
    @once "load", cb if cb?
    if @needsSlicing()
      @private.slicingInstance = SlicingEngineFactory.slice @, slicerConfig
    else
      setTimeout (=> @onSlicingComplete gcodePath: @private.filePath), 0

  onSlicingError: =>
    console.log "slicer error"
    @emit "job_error", "slicer error"

  onSlicingComplete: (slicer) =>
    join = Join.create()
    @currentLine = 0
    @private.slicingInstance = null
    if slicer.gcodePath != @private.filePath
      @private.gcodePath = slicer.gcodePath

    # Getting the number of lines in the file
    exec "wc -l #{slicer.gcodePath}", join.add()
    # Loading the gcode to memory
    fs.readFile slicer.gcodePath, 'utf8', join.add()
    join.when @_onLoadAndLineCount.fill new Date()

  _onLoadAndLineCount: (timestamp, lineCountArgs, loadArgs) =>
    # Deleting the gcode file now that it's loaded into memory
    @_deleteGCodeFile()
    # Stopping if the job was cancelled
    return if @_cancelledAfter timestamp
    # Parsing the loaded information and emitting the load event
    [err, gcode] = loadArgs
    @totalLines = parseInt(lineCountArgs[1].match(/\d+/)[0])
    if @totalLines == NaN or err?
      return @emit "job_error", "error loading gcode"
    @emit "load", err, gcode
