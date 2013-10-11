path = require ("flavored-path")
fs = require("fs-extra")
InstallBuilder = require("./install_builder")
require('sugar')

engineName = (opts) ->
  opts.slicingEngine.toLowerCase()

enginePath = (opts) ->
  name = engineName(opts)
  "#{module.exports.engineDir}/#{name}"

requireSlicer = (opts) ->
  Slicer = require "#{enginePath(opts)}/#{engineName(opts)}"

# Install
install = (opts, callback) ->
  dir = "#{module.exports.configDir}/#{opts.printerId}/#{engineName(opts)}"
  opts.configDir = path.resolve dir
  console.log opts.configDir
  fs.exists opts.configDir, installOnExists.fill(opts, callback, opts.configDir)

installOnExists = (opts, callback, dest, exists) ->
  return callback?() if exists
  console.log "Installing #{engineName(opts)}"
  Slicer = requireSlicer opts
  src = path.resolve enginePath opts
  installer = new InstallBuilder src, dest
  installer.run Slicer.install, callback

# Slice
slice = (opts) ->
  install opts, sliceOnInstall.fill(opts)

sliceOnInstall = (opts) ->
  Slicer = requireSlicer opts
  slicer = new Slicer opts
  slicer.slice()
  console.log "Slicing #{opts.filePath}"
  return slicer

module.exports = {
  slice: slice,
  configDir: "~/.construct",
  engineDir: path.resolve "#{__dirname}/slicers"
}
