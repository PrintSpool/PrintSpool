EventEmitter = require('events').EventEmitter
fs = require("fs-extra")
command = require('command')
os = require('os')
require 'sugar'

module.exports = class Cura
  app_paths:
    darwin: "/Applications/Cura/Cura.app/Contents/MacOS/Cura"

  constructor: (@opts) ->

  slice: ->
    cura = @app_paths[os.platform()] || 'cura'
    cmd = command.open(__dirname)
    .exec(cura, ["-s", @opts.file_path])
    .on('stdout', command.writeTo(process.stdout))
    .on('stderr', command.writeTo(process.stderr))
    .then(@_onComplete)

  _onComplete: =>
    console.log "complete!"
    @gcode_path = "#{@opts.file_path}.gcode"
    @opts.onComplete?(@)
