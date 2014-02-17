WebSocketServer = require('ws').Server
http = require("http")
express = require("express")
mdns = require('mdns2')
avahi = require('avahi_pub')
formidable = require('formidable')
nodeUUID = require('node-uuid')
pamAuth = require "express-pam"
modKeys = require('../vendor/mod_keys')
wsPamAuth = require('../vendor/ws_pam_auth')
# CameraRoute = require("./camera_route")

module.exports = class PrinterServer
  constructor: (opts) ->
    @[k] = opts[k] for k in ['name', 'printer', 'app']
    @slug = @name.underscore().replace("#", "")
    @path = "/printers/#{@slug}"
    @_clients = {}
    wssOpts =
      server: opts.server
      path: "#{@path}/socket"
      protocolVersion: 8
    wssOpts.verifyClient = wsPamAuth serviceName: "tegh" if opts.enableAuth
    @wss = new WebSocketServer wssOpts

    @wss.on "connection", @onClientConnect

    if avahi.isSupported()
      @avahiAd = avahi.publish
        name: @slug
        type: "_tegh._tcp"
        data: {txtvers:'1'}
        port: 2540
    else
      @mdnsAd = mdns.createAdvertisement "_tegh._tcp", 2540,
        name: @slug
        txtRecord: {txtvers:'1'}
      @mdnsAd.start()

    @printer.driver.on "disconnect", @onPrinterDisconnect
    @printer.on "change", @onPrinterChange
    @printer.on "add", @onPrinterAdd
    @printer.on "rm", @onPrinterRm

    @app.post "#{@path}/jobs", @createJob
    # initCamera()

  initCamera: =>
    @_camera = new CameraRoute @app, "#{@path}/cameras/1.mjpeg"

  createJob: (req, res) =>
    console.log "jeorb!"
    # Fail Fast
    ws = @_clients[req.query.session_uuid]
    return res.send 500, "Must include a valid uuid" unless ws?
    # Implementation
    form = new formidable.IncomingForm(keepExtensions: true)
    form.on 'error', (e) -> console.log (e)
    form.on 'progress', @_onJobProgress.fill(ws)
    form.parse req, @_onJobParsed.fill(res)

  _onJobProgress: (ws, bytesReceived, bytesExpected) =>
    msg =
      type: 'change'
      target: 'job_upload_progress'
      data: { uploaded: bytesReceived, total: bytesExpected }
    @send ws, [msg]

  _onJobParsed: (res, err, fields, files) =>
    return console.log err if err?
    @printer.addJob
      filePath: files.job.path
      qty: fields.qty || 1
      fileName: files.job.name
    res.end()

  broadcast: (data) =>
    data = modKeys.underscore data
    @send ws, data for ws in @wss.clients

  send: (ws, data) =>
    try
      ws.send JSON.stringify(data), @_onSend.fill(ws)
    catch
      try ws.close()

  _onSend: (ws, error) ->
    return unless error?
    console.log "error sending data to client"
    console.log error
    ws.terminate()

  onClientConnect: (ws) =>
    ws.on 'message', @onClientMessage.fill(ws)
    ws.on "close", @onClientDisconnect
    data = modKeys.underscore @printer.data
    uuid = nodeUUID.v4()
    Object.merge data, session: { uuid: uuid }
    @send ws, [{type: 'initialized', data: data}]
    @_clients[uuid] = ws
    console.log "#{@name}: Client Attached"

  onClientDisconnect: (wsA) =>
    (delete @_clients[uuid] if wsA == wsB) for uuid, wsB of @_clients
    console.log "#{@name}: Client Detached"

  _websocketActions: [
    'home',
    'move',
    'set',
    'estop',
    'print',
    'rm',
    'retry_print'
  ]

  onClientMessage: (ws, msgText, flags) =>
    try
      # Parsing / Fail fast
      msg = modKeys.camelize JSON.parse msgText
      if @_websocketActions.indexOf(msg.action) == -1
        throw new Error("#{msg.action} is not a valid action")
      # Executing the action and responding
      response = @printer[msg.action.camelize false](msg.data)
      @send ws, [type: 'ack']
    catch e
      console.log e.stack if e.stack?
      data = type: 'runtime.sync', message: e.toString()
      @send ws, [type: 'error', data: modKeys.underscore data]
    # console.log "client message:"
    # console.log msg

  onPrinterChange: (changes) =>
    # console.log "printer change:"
    # console.log changes
    @broadcast ( type: 'change', target: k, data: v for k, v of changes )

  onPrinterAdd: (target, value) =>
    @broadcast [type: 'add', target: target, data: value]

  onPrinterRm: (target) =>
    @broadcast [type: 'rm', target: target]

  onPrinterDisconnect: =>
    console.log "#{@name} Disconnecting.."
    # Removing all the event listeners from the server so it will be GC'd
    @printer.driver.removeAllListeners()
    @printer.removeAllListeners()
    # Removing the websocket
    try
      @wss.close()
    catch e
      console.log e.stack
    @wss.removeAllListeners()
    # Removing the Job upload route
    @app.routes.post.remove (route) => route.path = "#{@path}/jobs"
    # Removing the DNS-SD advertisement
    if @mdnsAd? then @mdnsAd.stop() else @avahiAd.remove()
    console.log "#{@name} Disconnected"
