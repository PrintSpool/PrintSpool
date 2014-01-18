EventEmitter = require('events').EventEmitter
fs = require("fs-extra")
os = require('os')
spawn = require('child_process').spawn
path = require ("flavored-path")
require 'sugar'

module.exports = class Cura
  appPaths:
    darwin: "/Applications/Cura/Cura.app/Contents/MacOS/Cura"

  constructor: (@configDir, @opts) ->

  slice: =>
    # console.log @opts
    # console.log @opts.filePath
    cura = @appPaths[os.platform()] || 'cura'
    args = ["-s", @opts.filePath]
    @proc = spawn(cura, args)
    @proc.stdout.on 'data', (data) -> console.log('stdout: ' + data)
    @proc.stderr.on 'data', (data) -> console.log('stderr: ' + data)
    @proc.on 'close', @_onExit

  cancel: =>
    @_cancelled = true
    @proc.kill() if @proc?

  _onExit: (code) =>
    @opts.onSlicingError?(@) if code != 0 and !@_cancelled
    # console.log "complete!"
    @gcodePath = "#{@opts.filePath}.gcode"
    @opts.onSlicingComplete?(@)

Cura.install = ->
  