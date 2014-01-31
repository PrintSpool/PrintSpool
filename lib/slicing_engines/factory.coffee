path = require ("flavored-path")
fs = require("fs-extra")
InstallBuilder = require path.join __dirname, "..", "install_builder"
_ = require 'lodash'

class Factory

  # opts = {engine: "", profile: ""}
  constructor: (@opts) ->
    # No need to recalculate these values after the first time.
    @[k] = _.memoize @[k] for k in ['engineName', 'enginePath', 'configPath']
    # Requiring the Slicing Engine (but not instantiating it)
    @Engine = require path.join @srcPath(), @engineName()

  engineName: ->
    @opts.engine.toLowerCase().underscore()

  srcPath: ->
    path.join module.exports.srcPath, @engineName()

  configPath: ->
    dirs = [module.exports.configPath, @engineName()]
    dirs << @opts.profile unless @Engine.sandboxDir == false
    return path.resolve path.join.apply path, dirs

  profile: ->
    @opts.profile

  install: (cb = ->) -> @Engine.isInstalled @, (installed) =>
    cb = _.partial cb, @configPath()
    return cb() if installed
    # If the slicing profile is not installed then install it.
    console.log "Installing #{@engineName()}"
    installer = new InstallBuilder @srcPath(), @configPath()
    installer.run _.partial(@Engine.install, @opts), cb

  # Slice
  slice = (filePath) -> @install =>
    slicer = new @Engine @opts, filePath
    slicer.slice()
    console.log "Slicing #{filePath}"
    return slicer

module.exports = {
  slice: (opts, filePath) -> new Factory(opts).slice(filePath),
  install: (opts, cb) -> new Factory(opts).install(cb),
  configPath: "~/.tegh",
  srcPath: path.resolve path.join __dirname, "slicing_engines"
}
