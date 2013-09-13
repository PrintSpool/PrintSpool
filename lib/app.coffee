http = require("http")
express = require("express")
PrintDriver = require("./print_driver")
Printer = require("./printer")
PrinterServer = require("./printer_server")

module.exports = class App
  constructor: ->
    @printer_servers = []

    @server = express()
    # @server.use express.static(__dirname + "../public")
    @server.listen 3000

    PrintDriver.listen()
    PrintDriver.on "connect", @_onPrinterConnect
    PrintDriver.on "disconnect", @_onPrinterDisconnect

    @server.get '/printers.json', @getPrintersJson

  getPrintersJson: (req, res) =>
    res.send printers: @printer_servers.map (p) -> p.path

  _onPrinterConnect: (port) =>
    console.log "connected"
    # setting up the serial driver
    driver = new PrintDriver(port: port)
    driver.verbose = true
    # setting up the printer
    settings = undefined
    components = undefined
    printer = new Printer driver, settings, components
    # setting up the server
    opts =
      printer: printer
      server: @server
      path: "/printers/#{port.serialNumber}/socket"
      port: port
    # console.log opts.port
    console.log opts.path
    @printer_servers.push new PrinterServer opts

  _onPrinterDisconnect: (port) ->
    @printer_servers.remove (p) -> p.port == port

app = new App()
