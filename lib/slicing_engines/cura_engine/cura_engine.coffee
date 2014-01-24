EventEmitter = require('events').EventEmitter
fs = require("fs-extra")
os = require('os')
spawn = require('child_process').spawn
path = require ("flavored-path")
yaml = require('js-yaml')
# calcYamlType = require('../../yaml_calc')
require 'sugar'

SCHEMA = yaml.Schema.create([]);#[ calcYamlType ]);

module.exports = class CuraEngine extends EventEmitter

  constructor: (@opts) ->
    console.log @opts.slicingProfile
    ymlFileName = "#{@opts.profile()}_profile.yml"
    @_configPath = path.join @opts.configPath(), ymlFileName

  _gcodePath: =>
    "#{@filePath}.gcode"

  slice: (@filePath) =>
    # console.log @opts
    # console.log @opts.filePath
    fs.readFile @_configPath, 'utf8', @_onConfigFileLoad

  _onConfigFileLoad: (err, configString) =>
    return if @_cancelled
    return @emit "error", new Error err if err?

    try
      config = yaml.load configString, filename: @_configPath, schema: SCHEMA
    catch e
      return @emit "error", e

    args = []
    for k,v of config
      v = v.call(config) if typeof(v) == "function"
      args.push("-s")
      args.push("#{k}=#{v}")
    args.push "-o"
    args.push @_gcodePath()
    args.push @filePath
    # console.log args

    @proc = spawn("curaengine", args)
    @proc.stdout.on 'data', (data) -> console.log('stdout: ' + data)
    @proc.stderr.on 'data', (data) -> console.log('stderr: ' + data)
    @proc.on 'close', @_onExit

  cancel: =>
    @_cancelled = true
    @proc.kill() if @proc?

  _onExit: (code) =>
    if code != 0 and !@_cancelled
      return @emit "error" new Error "Slicing failed with code:#{code}"
    # console.log "complete!"
    @gcodePath = @_gcodePath()
    @emit "complete"

CuraEngine.sandboxDir = false
CuraEngine.isInstalled = (opts, cb) ->
  fs.exists "#{opts.configPath()}/#{opts.profile()}_profile.yml", cb
CuraEngine.install = (opts) ->
  @install "cura_engine_defaults.yml"
  @mv "cura_engine_defaults.yml", "#{opts.profile()}_profile.yml"
