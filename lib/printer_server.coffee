WebSocketServer = require('ws').Server
http = require("http")
express = require("express")
print_driver = require("./print_driver")
mdns = require('mdns2')
formidable = require('formidable')

module.exports = class PrinterServer
  constructor: (opts) ->
    @[k] = opts[k] for k,v of opts
    @wss = new WebSocketServer
      server: opts.server
      path: "#{opts.path}/socket"
      protocolVersion: 8

    @wss.on "connection", @onClientConnect

    @ad = mdns.createAdvertisement "_construct._tcp", 2540,
      name: opts.slug
      txtRecord: {txtvers:'1'}
    @ad.start()
    @printer.driver.on "disconnect", @onPrinterDisconnect
    @printer.on "change", @onPrinterChange
    @app.post "#{opts.path}/jobs", @createJob

  createJob: (req, res) =>
    form = new formidable.IncomingForm()
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
      output.push type: 'change', target: k, data: v
    @broadcast JSON.stringify output

  onPrinterDisconnect: =>
    @printer.removeAllListeners()
    @wss.close()
    @wss.removeAllListeners()
    @ad.stop()
    console.log "#{@name}: Disconnected"
