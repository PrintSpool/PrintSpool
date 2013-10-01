http = require("http")
express = require("express")
PrintDriver = require("./print_driver")
Printer = require("./printer")
PrinterServer = require("./printer_server")
require("js-yaml")
fs = require 'fs-extra'
path = require ("flavored-path")

APP_NAME = 'construct'

module.exports = class App
  constructor: ->
    @printer_servers = []

    @app = express()
    # @app.use express.static(__dirname + "../public")
    @server = http.createServer(@app).listen(2540)

    PrintDriver.listen()
    PrintDriver.on "connect", @_onPrinterConnect
    PrintDriver.on "disconnect", @_onPrinterDisconnect

    @app.get '/printers.json', @getPrintersJson

  getPrintersJson: (req, res) =>
    res.send printers: @printer_servers.map (p) -> p.slug

  _onPrinterConnect: (port) =>
    # loading the config file (or creating a new one)
    configFile = path.get "~/.#{APP_NAME}/#{port.serialNumber}/#{APP_NAME}.yml"
    try
      config = require configFile
    catch
      console.log "New printer detected. Creating a config file."
      fs.outputFile configFile, '', -> console.log "done"
    config ?= {}

    # setting up the serial driver
    driver = new PrintDriver
      port: port
      polling: true
      verbose: config.verbose
    # setting up the printer
    settings = config.settings
    components = config.components
    printer = new Printer driver, settings, components
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
    @printer_servers.push new PrinterServer opts
    console.log "#{opts.name} Connected"

  _onPrinterDisconnect: (port) =>
    @printer_servers.remove (p) -> p.port == port

app = new App()
