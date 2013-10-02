EventEmitter = require('events').EventEmitter
fs = require("fs-extra")
command = require('command')
os = require('os')
path = require ("flavored-path")
require 'sugar'

module.exports = class Cura
  appPaths:
    darwin: "/Applications/Cura/Cura.app/Contents/MacOS/Cura"

  constructor: (@opts) ->

  slice: =>
    # console.log @opts
    # console.log @opts.filePath
    cura = @appPaths[os.platform()] || 'cura'
    cmd = command.open(path.resolve("~"))
    .exec(cura, ["-s", @opts.filePath])
    .on('stdout', command.writeTo(process.stdout))
    .on('stderr', command.writeTo(process.stderr))
    .on('exit', @_onExit)

  _onExit: (code) =>
    @opts.onError?(@) if code != 0
    # console.log "complete!"
    @gcodePath = "#{@opts.filePath}.gcode"
    @opts.onComplete?(@)
