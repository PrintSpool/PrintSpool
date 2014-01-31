EventEmitter = require('events').EventEmitter
fs = require("fs-extra")
os = require('os')
spawn = require('child_process').spawn
path = require ("flavored-path")
require 'sugar'

module.exports = class Cura
  appPaths:
    darwin: "/Applications/Cura/Cura.app/Contents/MacOS/Cura"

  constructor: (@opts) ->

  slice: (@filePath) =>
    # console.log @filePath
    cura = @appPaths[os.platform()] || 'cura'
    args = ["-s", @filePath]
    @proc = spawn(cura, args)
    @proc.stdout.on 'data', (data) -> console.log('stdout: ' + data)
    @proc.stderr.on 'data', (data) -> console.log('stderr: ' + data)
    @proc.on 'close', @_onExit

  cancel: =>
    @_cancelled = true
    @proc.kill() if @proc?

  _onExit: (code) =>
    if code != 0 and !@_cancelled
      @emit "error", new Error "Slicing failed with code:#{code}"
    # console.log "complete!"
    @gcodePath = "#{@filePath}.gcode"
    @emit "complete"

Cura.install = ->
  