spawn = require('child_process').spawn
EventEmitter = require('events').EventEmitter
tmp = require("tmp")
tmp.setGracefulCleanup()
fs = require("fs")
path = require("path")
chokidar = require('chokidar')
_ = require('lodash')

module.exports = class Photo extends EventEmitter

  constructor: (@cameraNumber, @period = 1) ->
    tmp.dir @_onTempDirCreate

  _onTempDirCreate: (err, @_dirPath) =>
    # console.log @_dirPath
    @_index = 0
    return @emit "unable to create temp directory" if err?
    @_watcher = chokidar.watch @_dirPath, persistent: false
    @_watcher.on 'add', @_onCaptureFile
    @_startProc()

  _startProc: =>
    @_proc = spawn 'imagesnap', ['-t', @period.toString(), '-v'], cwd: @_dirPath
    # @_proc.stdout.on "data", (data) -> console.log "camera: #{data}"
    # @_proc.stderr.on "data", (data) -> console.log "camera: #{data}"
    @_proc.on('close', @_onClose)

  _onCaptureFile: (path) =>
    fs.readFile path, _.partial @_onCaptureData, path

  _onCaptureData: (path, err, buffer) =>
    # console.log "camera change!"
    fs.unlink path
    if err?
      @emit "error", err
    else
      @emit "data", buffer

  _onClose: (code) =>
    return if @_cosed
    console.log "camera closed. restarting."
    @_startProc()

  close: =>
    @_closed = true
    @_proc.kill() if @_proc?
