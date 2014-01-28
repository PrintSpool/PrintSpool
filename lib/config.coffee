EventEmitter = require('events').EventEmitter
modKeys = require('../vendor/mod_keys')
SmartObject = require('../vendor/smart_object')
_ = require 'lodash'
path = require 'path'
fs = require 'fs'

module.exports = class Config extends EventEmitter
  # These properties we will have to reload the server for.
  serverReloadingProps: ['name', 'driver', 'polling']
  # These properties are static.
  staticAttrs: ['app', 'server', 'port']

  _defaults: ->
    # These properties we will have to reload the server for.
    name: "Printer ##{@port.serialNumber}"
    driver: "serial_gcode"
    polling: true
    # These properties we can outright ignore because they don't have any state.
    verbose: false
    pauseBetweenPrints: true
    # These properties we can send updates through the websocket for
    components: { e0: 'heater', b: 'heater', c: 'conveyor', f: 'fan' }
    printQualities: {default: "normal", options: @_defaultQualityOptions()}

  _defaultQualityOptions: ->
    draft:
      engine: "cura_engine"
      profile: "default"
      params: {layer_height: 10, infill: 5}
    normal:
      engine: "cura_engine"
      profile: "default"
      params: {layer_height: 5, infill: 20}
    high:
      engine: "cura_engine"
      profile: "default"
      params: {layer_height: 2, infill: 50}

  constructor: (@port, arg) ->
    if typeof arg == 'string'
      @filePath = arg
      @_initFromFile()
    else
      @_initFromObj arg

  _initFromFile: ->
    try
      obj = require @filePath
      @_onFileReady()
    catch
      console.log "New printer detected. Creating a config file."
      installer = new InstallBuilder __dirname, path.dirname @filePath
      installer.run _.partial(@_install, @filePath), @_onFileReady
    if @$?
      @_reload obj
    else
      @_initFromObj obj

  _initProperties: (obj) ->
    _.merge @_defaults(), modKeys.camelize obj

  _initFromObj: (obj = {}) ->
    obj = @_initProperties obj
    for k in @staticAttrs
      @[k] ?= obj[k]
      delete obj[k]
    @$ = new SmartObject obj
    @$.on k, _.bind(@emit, @, k) for k in ['add', 'rm', 'change']
    Object.defineProperty @, k, get: _.partial @_get, k for k, v of @$.buffer

  _reload: (obj = {}) ->
    @$.merge @_initProperties obj

  _install: (filePath) ->
    @install 'config_defaults.yml'
    @mv 'config_defaults.yml', path.basename filePath

  _onFileReady: =>
    return if @_watcher?
    # initializing the config file watching and reloading
    @_watcher = fs.watch(@filePath, persistent: false)
    .on "change", @_onFileChange

  _onFileChange: =>
    @_initFromFile()

  kill: =>
    @_watcher?.close?()
    @removeAllListeners()
    @$.removeAllListeners()
    @$ = undefined

  _get: (key) =>
    @$.buffer[key]
