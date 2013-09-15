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
    ws.on 'message', @onClientMessage.fill(ws)
    console.log "wutttt"
    ws.send JSON.stringify [{type: 'initialized', data: @printer.data}]
    console.log "started client interval"

  onClientDisconnect: (ws) =>
    console.log "boo"
    console.log "stopping client interval"

  onClientMessage: (ws, msgText, flags) =>
    try
      msg = JSON.parse msgText
      response = @printer[msg.action.camelize(false)](msg.data)
      response = jobs: response if msg.action == 'get_jobs'
      ws.send JSON.stringify [type: 'ack', data: response||{}]
    catch e
      console.log e.stack
      data = type: 'runtime.sync', message: e.toString()
      ws.send JSON.stringify [type: 'error', data: data]
    console.log "client message:"
    console.log msg

  onPrinterDisconnect: =>
    @printer.removeAllListeners()
    @wss.close()
    @wss.removeAllListeners()
    @ad.stop()
    console.log "#{@name} Disconnected"
