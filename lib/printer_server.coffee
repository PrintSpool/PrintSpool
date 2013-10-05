WebSocketServer = require('ws').Server
http = require("http")
express = require("express")
print_driver = require("./print_driver")
mdns = require('mdns2')
avahi = require('avahi_pub')
formidable = require('formidable')

module.exports = class PrinterServer
  constructor: (opts) ->
    @[k] = opts[k] for k,v of opts
    @wss = new WebSocketServer
      server: opts.server
      path: "#{opts.path}/socket"
      protocolVersion: 8

    @wss.on "connection", @onClientConnect

    if avahi.isSupported()
      @avahiAd = avahi.publish
        name: opts.slug
        type: "_construct._tcp"
        data: {txtvers:'1'}
        port: 2540
    else
      @mdnsAd = mdns.createAdvertisement "_construct._tcp", 2540,
        name: opts.slug
        txtRecord: {txtvers:'1'}
      @mdnsAd.start()

    @printer.driver.on "disconnect", @onPrinterDisconnect
    @printer.on "change", @onPrinterChange
    @printer.on "add", @onPrinterAdd
    @printer.on "rm", @onPrinterRm
    @app.post "#{opts.path}/jobs", @createJob

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
    @broadcast JSON.stringify [msg]

  _onJobParsed: (res, err, fields, files) =>
    return console.log err if err?
    @printer.addJob
      gcode: files.job.path
      qty: (fields.qty || 1)
      name: files.job.name
    res.end()

  broadcast: (data) =>
    client.send(data) for client in @wss.clients

  onClientConnect: (ws) =>
    ws.on 'message', @onClientMessage.fill(ws)
    ws.on "close", @onClientDisconnect
    ws.send JSON.stringify [{type: 'initialized', data: @printer.data}]
    console.log "#{@name}: Client Attached"

  onClientDisconnect: (ws) =>
    console.log "#{@name}: Client Detached"

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
    # console.log "client message:"
    # console.log msg

  onPrinterChange: (changes) =>
    # console.log "printer change:"
    # console.log changes
    output = []
    for k, v of changes
      v = @_underscoreData(v)
      output.push type: 'change', target: k.underscore(), data: v
    @broadcast JSON.stringify output

  _underscoreData: (originalData) ->
    return originalData unless Object.isObject(originalData)
    data = {}
    data[k2.underscore()] = v2 for k2, v2 of originalData
    return data

  onPrinterAdd: (target, value) =>
    @broadcast JSON.stringify [type: 'add', target: target, data: value]

  onPrinterRm: (target) =>
    @broadcast JSON.stringify [type: 'rm', target: target]

  onPrinterDisconnect: =>
    @printer.removeAllListeners()
    @wss.close()
    @wss.removeAllListeners()
    if @mdnsAd? then @mdnsAd.stop() else @mdnsAd.remove()
    console.log "#{@name}: Disconnected"
