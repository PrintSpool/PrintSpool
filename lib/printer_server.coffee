WebSocketServer = require('ws').Server
http = require("http")
express = require("express")
mdns = require('mdns2')
avahi = require('avahi_pub')
formidable = require('formidable')

module.exports = class PrinterServer
  constructor: (opts) ->
    @[k] = opts[k] for k,v of opts
    @path = "/printers/#{@slug}"
    @wss = new WebSocketServer
      server: opts.server
      path: "#{@path}/socket"
      protocolVersion: 8

    @wss.on "connection", @onClientConnect

    if avahi.isSupported()
      @avahiAd = avahi.publish
        name: opts.slug
        type: "_tegh._tcp"
        data: {txtvers:'1'}
        port: 2540
    else
      @mdnsAd = mdns.createAdvertisement "_tegh._tcp", 2540,
        name: opts.slug
        txtRecord: {txtvers:'1'}
      @mdnsAd.start()

    @printer.driver.on "disconnect", @onPrinterDisconnect
    @printer.on "change", @onPrinterChange
    @printer.on "add", @onPrinterAdd
    @printer.on "remove", @onPrinterRm

    @app.post "#{@path}/jobs", @createJob

  createJob: (req, res) =>
    form = new formidable.IncomingForm(keepExtensions: true)
    form.on 'error', (e) -> console.log (e)
    form.on 'progress', @_onJobProgress
    form.parse req, @_onJobParsed.fill(res)

  _onJobProgress: (bytesReceived, bytesExpected) =>
    msg =
      type: 'change'
      target: 'job_upload_progress'
      data: { uploaded: bytesReceived, total: bytesExpected }
    @broadcast [msg]

  _onJobParsed: (res, err, fields, files) =>
    return console.log err if err?
    @printer.addJob
      filePath: files.job.path
      qty: fields.qty
      name: files.job.name
    res.end()

  broadcast: (data) =>
    @send ws, data for ws in @wss.clients

  send: (ws, data) =>
    ws.send JSON.stringify(data), @_onSend.fill(ws)

  _onSend: (ws, error) ->
    return unless error?
    console.log "error sending data to client"
    console.log error
    ws.terminate()

  onClientConnect: (ws) =>
    ws.on 'message', @onClientMessage.fill(ws)
    ws.on "close", @onClientDisconnect
    data = @_underscoreData @printer.data
    @send ws, [{type: 'initialized', data: data}]
    console.log "#{@name}: Client Attached"

  onClientDisconnect: (ws) =>
    console.log "#{@name}: Client Detached"

  onClientMessage: (ws, msgText, flags) =>
    try
      msg = JSON.parse msgText
      response = @printer[msg.action.camelize(false)](msg.data)
      response = jobs: response if msg.action == 'get_jobs'
      @send ws, [type: 'ack', data: response||{}]
    catch e
      console.log e.stack
      data = type: 'runtime.sync', message: e.toString()
      @send ws, [type: 'error', data: data]
    # console.log "client message:"
    # console.log msg

  onPrinterChange: (changes) =>
    # console.log "printer change:"
    # console.log changes
    output = []
    for k, v of changes
      v = @_underscoreData(v)
      output.push type: 'change', target: k.underscore(), data: v
    @broadcast output

  _underscoreData: (originalData) =>
    return originalData unless Object.isObject(originalData)
    data = {}
    data[k2.underscore()] = @_underscoreData(v2) for k2, v2 of originalData
    return data

  onPrinterAdd: (target, value) =>
    @broadcast [type: 'add', target: target, data: value]

  onPrinterRm: (target) =>
    @broadcast [type: 'rm', target: target]

  onPrinterDisconnect: =>
    console.log "#{@name} Disconnecting.."
    # Removing all the event listeners from the server so it will be GC'd
    @printer.removeAllListeners()
    # Removing the websocket
    @wss.close()
    @wss.removeAllListeners()
    # Removing the Job upload route
    @app.routes.post.remove (route) => route.path = "#{@path}/jobs"
    # Removing the DNS-SD advertisement
    if @mdnsAd? then @mdnsAd.stop() else @avahiAd.remove()
    console.log "#{@name} Disconnected"
