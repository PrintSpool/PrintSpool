SegfaultHandler = require('segfault-handler')
http = require("http")
express = require("express")
ArudinoDiscoverer = require("./arduino_discoverer")
PrintDriverFactory = require("./print_driver_factory")
Printer = require("./printer")
PrinterServer = require("./printer_server")
require("js-yaml")
fs = require 'fs-extra'
path = require ("flavored-path")
InstallBuilder = require './install_builder'
SlicingEngineFactory = require("../lib/slicing_engine_factory")

APP_NAME = 'tegh'

stdio = require('stdio')

options = stdio.getopt
  'dry-run':
    description: "Adds a null driver printer for testing and development."

SegfaultHandler.registerHandler()

camelizeData = (originalData) =>
  return originalData unless Object.isObject(originalData)
  data = {}
  for k2, v2 of originalData
    k2 = k2.camelize(false).replace 'Mm', 'MM'
    data[k2] = camelizeData(v2)
  return data

module.exports = class App
  constructor: ->
    @printer_servers = []

    @app = express()
    # @app.use express.static(__dirname + "../public")
    @server = http.createServer(@app).listen(2540)

    ArudinoDiscoverer.listen()
    ArudinoDiscoverer.on "connect", @_onPrinterConnect

    @app.get '/printers.json', @getPrintersJson
    @initDryRunPrinter() if options['dry-run'] == true

  getPrintersJson: (req, res) =>
    res.send printers: @printer_servers.map (p) -> p.slug

  initDryRunPrinter: () ->
    driver = PrintDriverFactory.build driver: "null"

    settings = {slicingEngine: 'cura_engine', slicingProfile: 'default'}

    printer = new Printer "dev null", driver, settings
    # setting up the server
    opts =
      app: @app
      printer: printer
      server: @server
      serialNumber: "dev null"
      name: "Dev Null Printer"
      slug: "dev_null_printer"
      # path: "/printers/dev_null_printer"
    console.log "#{opts.name} Connecting.."
    ps = new PrinterServer opts
    @printer_servers.push ps
    console.log "[Dry Run] Dev Null Printer Connected"

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
    config = camelizeData config
    # console.log config

    # setting up the printer (defaults)
    settings = {slicingEngine: 'cura_engine', slicingProfile: 'default'}

    Object.merge settings, Object.reject config, ['components', 'verbose', 'name']
    components = config.components

    # setting up the serial driver
    driver = PrintDriverFactory.build
      driver: settings.driver
      port: port
      polling: true
      verbose: config.verbose

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
      # path: "/printers/#{slug}"
      port: port
    console.log "#{opts.name} Connecting.."
    ps = new PrinterServer opts
    @printer_servers.push ps
    driver.on "disconnect", @_onPrinterDisconnect.fill(ps)
    console.log "#{opts.name} Connected"

  _onPrinterDisconnect: (ps) =>
    @printer_servers.remove ps

app = new App()
