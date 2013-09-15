WebSocketServer = require('ws').Server
http = require("http")
express = require("express")
print_driver = require("./print_driver")
mdns = require('mdns2')

module.exports = class PrinterServer
  constructor: (opts) ->
    @[k] = opts[k] for k,v of opts
    @wss = new WebSocketServer
      server: opts.server
      path: opts.path
      protocolVersion: 8

    @wss.on "connection", @onClientConnect
    @wss.on "close", @onClientDisconnect

    @ad = mdns.createAdvertisement "_construct._tcp", 2540,
      name: opts.slug
      txtRecord: {txtvers:'1'}
    @ad.start()
    @printer.driver.on "disconnect", @onPrinterDisconnect

  onClientConnect: (ws) =>
    console.log "wutttt"
    ws.send JSON.stringify([{type: 'initialized', data: @printer.data}])
    console.log "started client interval"

  onClientDisconnect: (ws) =>
    console.log "boo"
    console.log "stopping client interval"

  onPrinterDisconnect: =>
    @printer.removeAllListeners()
    @wss.close()
    @wss.removeAllListeners()
    @ad.stop()
    console.log "#{@name} Disconnected"
