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
    # @_capturer = new ImageSnapSingleProc(@cameraNumber, @period, @_onCaptureData)
    @_capturer = new ImageSnapMultiProc(@cameraNumber, @period, @_onCaptureData)

  _onCaptureData: (err, buffer) =>
    console.log "camera change!"
    # console.log buffer
    if err?
      @emit "error", err
    else
      @emit "data", buffer

  close: =>
    @_capturer.close()

class ImageSnapSingleProc
  constructor: (@cameraNumber, @period, @_onCaptureData) ->
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
    fs.readFile path, _.partial @_onCaptureFileRead, path

  _onCaptureFileRead: (path, err, buffer) =>
    fs.unlink path
    @_onCaptureData(err, buffer)


  _onClose: (code) =>
    return if @_cosed
    console.log "camera closed. restarting."
    @_startProc()

  close: =>
    @_closed = true
    @_proc.kill() if @_proc?


class ImageSnapMultiProc
  constructor: (@cameraNumber, @period, @_onCaptureData) ->
    @_startProc()

  _startProc: =>
    @_buffers = []
    @_timeout = undefined
    @_proc = spawn 'imagesnap', ['-']
    @_proc.stdout.on "data", @_onData
    # @_proc.stderr.on "data", (data) -> console.log "camera: #{data}"
    @_proc.on('close', @_onClose)

  _onData: (buffer) =>
    @_buffers.push buffer

  _onClose: (err) =>
    return if @_closed
    @_proc = undefined
    buffer = Buffer.concat @_buffers
    err = undefined if err == 0
    @_onCaptureData(err, buffer)
    @_timeout = setTimeout @_startProc, @period

  close: =>
    @_closed = true
    @_proc.kill() if @_proc?
    clearTimeout @_timeout if @_timeout?

class CamelotMultiProc
  constructor: (@cameraNumber, @period, @_onCaptureData) ->
    @_camelot = new require('camelot')()
    @_camelot.on 'frame', (image) -> @_onCaptureData undefined, image
    @_camelot.on 'error', (err) -> @_onCaptureData err, undefined
    @_grab()
    @_interval = setInterval @_grab, @period

  _grab: =>
    @_camelot.grab {}

  close: =>
    clearInterval @_interval if @_interval?
