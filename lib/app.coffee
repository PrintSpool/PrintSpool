SegfaultHandler = require('segfault-handler')
http = require("http")
express = require("express")
PrintDriver = require("./print_driver")
Printer = require("./printer")
PrinterServer = require("./printer_server")
require("js-yaml")
fs = require 'fs-extra'
path = require ("flavored-path")
InstallBuilder = require './install_builder'
SlicingEngineFactory = require("../lib/slicing_engine_factory")

APP_NAME = 'construct'

SegfaultHandler.registerHandler()

module.exports = class App
  constructor: ->
    @printer_servers = []

    @app = express()
    # @app.use express.static(__dirname + "../public")
    @server = http.createServer(@app).listen(2540)

    PrintDriver.listen()
    PrintDriver.on "connect", @_onPrinterConnect

    @app.get '/printers.json', @getPrintersJson

  getPrintersJson: (req, res) =>
    res.send printers: @printer_servers.map (p) -> p.slug

  _installConfig: (configFile) ->
    @install 'config_defaults.yml'
    @mv 'config_defaults.yml', configFile

  _onPrinterConnect: (port) =>
    # loading the config file (or creating a new one)
    configDir = path.get "~/.#{APP_NAME}/3d_printers/by_serial/"
    configFile = "#{port.serialNumber}.yml"
    try
      config = require "#{configDir}/#{configFile}"
    catch
      console.log "New printer detected. Creating a config file."
      installer = new InstallBuilder __dirname, configDir
      installer.run @_installConfig.fill(configFile), -> console.log "Done"
    config ?= {}

    # setting up the serial driver
    driver = new PrintDriver
      port: port
      polling: true
      verbose: config.verbose

    # setting up the printer (defaults)
    settings = {slicingEngine: 'cura_engine', slicingProfile: 'default'}

    for k, v of Object.reject config, ['components', 'verbose', 'name']
      settings[k.camelize(false)] = v
    components = config.components

    SlicingEngineFactory.install
      slicingEngine: settings.slicingEngine
      slicingProfile: settings.slicingProfile

    printer = new Printer port.serialNumber, driver, settings, components
    # setting up the server
    slug = config.name?.underscore?() || port.serialNumber
    opts =
      app: @app
      printer: printer
      server: @server
      serialNumber: port.serialNumber
      name: config.name || "Printer ##{port.serialNumber}"
      slug: slug
      path: "/printers/#{slug}"
      port: port
    console.log "#{opts.name} Connecting.."
    ps = new PrinterServer opts
    @printer_servers.push ps
    driver.on "disconnect", @_onPrinterDisconnect.fill(ps)
    console.log "#{opts.name} Connected"

  _onPrinterDisconnect: (ps) =>
    @printer_servers.remove ps

app = new App()
