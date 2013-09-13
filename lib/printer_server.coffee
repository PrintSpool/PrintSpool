WebSocketServer = require('ws').Server
http = require("http")
express = require("express")
print_driver = require("./print_driver")

module.exports = class PrinterServer
  constructor: (opts) ->
    @path = opts.path
    @port = opts.port
    @wss = new WebSocketServer server: opts.server, path: opts.path

    @wss.on "connection", @onClientConnect
    @wss.on "close", @onClientDisconnect

  onClientConnect: (ws) ->
    ws.send JSON.stringify({test: "Test"})
    console.log "started client interval"

  onClientDisconnect: (ws) ->
    console.log "stopping client interval"
    clearInterval id
