path = require ("flavored-path")
fs = require("fs-extra")
InstallBuilder = require("./install_builder")
require('sugar')

engineName = (opts) ->
  opts.slicingEngine.toLowerCase()

enginePath = (opts) ->
  name = engineName(opts)
  "#{module.exports.engineDir}/#{name}"

requireSlicingEngine = (opts) ->
  Slicer = require "#{enginePath(opts)}/#{engineName(opts)}"

# Install
install = (opts, callback = ->) ->
  Slicer = requireSlicingEngine opts
  dir = [module.exports.configDir, engineName(opts)]
  if !(Slicer.sandboxDir?) or (Slicer.sandboxDir)
    dir << opts.slicingProfile.toString()
  configDir = path.resolve dir.join '/'
  cb = installifNotInstalled.fill(opts, callback, configDir)
  if Slicer.isInstalled?
    installOpts = configDir: configDir, slicingProfile: opts.slicingProfile
    Slicer.isInstalled installOpts, cb
  else
    fs.exists configDir, cb

installifNotInstalled = (opts, callback, dest, isInstalled) ->
  return callback?(dest) if isInstalled
  console.log "Installing #{engineName(opts)}"
  Slicer = requireSlicingEngine opts
  src = path.resolve enginePath opts
  installer = new InstallBuilder src, dest
  installer.run Slicer.install.fill(opts), callback.fill(dest)

# Slice
slice = (opts) ->
  install opts, sliceOnInstall.fill(undefined, opts)

sliceOnInstall = (configDir, opts) ->
  Slicer = requireSlicingEngine opts
  slicer = new Slicer configDir, opts
  slicer.slice()
  console.log "Slicing #{opts.filePath}"
  return slicer

module.exports = {
  slice: slice,
  install: install,
  configDir: "~/.tegh",
  engineDir: path.resolve "#{__dirname}/slicing_engines"
}
