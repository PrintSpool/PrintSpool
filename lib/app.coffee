requireRelative = (args...) ->
  args.shift __dirname
  require path.join.apply path, args
# 3rd Party Libraries
SegfaultHandler = require "segfault-handler"
http = require "http"
express = require "express"
fs = require "fs-extra"
path = require "flavored-path"
_ = require 'lodash'
require "js-yaml"
# Source Libraries
InstallBuilder        = requireRelative "install_builder"
SlicingFactory        = requireRelative "slicing_engines", "factory"
ArudinoDiscoverer     = requireRelative "arduino_discoverer"
DriverFactory         = requireRelative "drivers", "factory"
Printer               = requireRelative "printer"
PrinterServer         = requireRelative "printer_server"
Config                = requireRelative "config"

APP_NAME = 'tegh'

stdio = require('stdio')

options = stdio.getopt
  'dry-run':
    description: "Adds a null driver printer for testing and development."

SegfaultHandler.registerHandler()

module.exports = class App
  constructor: ->
    # intializing the server
    @printerServers = {}
    @app = express()
    @server = http.createServer(@app).listen(2540)
    @app.get '/printers.json', @getPrintersJson
    # Adding printers
    @addDryRunPrinter() if options['dry-run'] == true
    ArudinoDiscoverer.listen().on "update", @_onSerialPortsUpdate

  getPrintersJson: (req, res) =>
    res.send printers: Object.map @printerServers, (p) -> p.slug

  _onSerialPortsUpdate: (ports) =>
    newPorts = ports.filter (p) => !(@printerServers[p.comName]?)
    @addPrinter port for port in newPorts

  _initConfig: (port) ->
    # loading the config file (or creating a new one)
    dir = path.get "~/.#{APP_NAME}/3d_printers/by_serial/"
    configPath = path.join dir, "#{port.serialNumber}.yml"
    # initializing the config object
    return new Config port, configPath

  addPrinter: (port, config) =>
    config ?= @_initConfig port
    # installing the slicing engines
    SlicingFactory.install v for k, v in config.printQualities.options
    # initializing the serial driver
    driver = DriverFactory.build config
    # intializing the printer and server
    @_initPrinter driver, config

  addDryRunPrinter: ->
    driver = DriverFactory.build driver: "null"
    port = serialNumber: "dev_null", comName: "dev/null"
    config = new Config port, name: "Dev Null Printer"
    @_initPrinter config, driver

  _initPrinter: (driver, config) ->
    console.log "#{config.name} Connecting.."
    # initializing the printer and appending config data
    config.@$.set 'printer', new Printer(driver, config)
    config.@$.set k, @[k] for k in ['app', 'server']
    config.on 'change', _.partial(@_onConfigChange, driver, config)
    # initializing the server routes
    @printerServers[config.port.comName] = ps = new PrinterServer config
    # removing the printer when it is disconnected
    driver.on "disconnect", @_onPrinterDisconnect.fill(ps)
    console.log "#{config.name} Connected"

  _onConfigChange: (driver, config, changes) ->
    # Checking if this change requires restarting the driver/printer/server
    props = config.serverReloadingProps
    return unless _.some changes, (v, k) -> _.contains props, k
    # Reloading the driver/printer/server
    driver.kill()
    config.removeAllListeners()
    @addPrinter config.port, config

  _onPrinterDisconnect: (psA) =>
    ( delete @printServers[k] if psA == psB ) for k, psB of @printerServers

app = new App()
