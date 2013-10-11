EventEmitter = require('events').EventEmitter
fs = require("fs-extra")
os = require('os')
spawn = require('child_process').spawn
path = require ("flavored-path")
yaml = require('js-yaml')
# calcYamlType = require('../../yaml_calc')
require 'sugar'

SCHEMA = yaml.Schema.create([]);#[ calcYamlType ]);

module.exports = class CuraEngine

  constructor: (@opts) ->
    @_configPath = "#{@opts.configDir}/cura_engine.yml"

  slice: =>
    # console.log @opts
    # console.log @opts.filePath
    fs.readFile @_configPath, 'utf8', @_onConfigFileLoad

  _gcodePath: =>
    "#{@opts.filePath}.gcode"

  _onConfigFileLoad: (err, configString) =>
    console.log err
    @emit "error", err if err
    config = yaml.load configString, filename: @_configPath, schema: SCHEMA

    args = []
    for k,v of config
      v = v.call(config) if typeof(v) == "function"
      args.push("-s")
      args.push("#{k}=#{v}")
    args.push "-o"
    args.push @_gcodePath()
    args.push @opts.filePath
    # console.log args

    proc = spawn("curaengine", args)
    proc.stdout.on 'data', (data) -> console.log('stdout: ' + data)
    proc.stderr.on 'data', (data) -> console.log('stderr: ' + data)
    proc.on 'close', @_onExit

  _onExit: (code) =>
    @opts.onError?(@) if code != 0
    # console.log "complete!"
    @gcodePath = @_gcodePath()
    @opts.onComplete?(@)

CuraEngine.install = ->
  @install "cura_engine_defaults.yml"
  @mv "cura_engine_defaults.yml", "cura_engine.yml"
