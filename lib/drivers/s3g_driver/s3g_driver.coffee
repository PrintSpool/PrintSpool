serialport = require("serialport")
SerialPrinterDiscoverer = require '../serial_gcode_driver/serial_gcode_driver'
GCodeInterprettor = require './s3g_gcode_interprettor'
PacketBuilder = require './s3g_packet_builder'
AbstractSerialDriver = require '../abstract_serial_driver'
responseSizes = require './s3g_response_sizes'

module.exports = class S3GDriver extends AbstractSerialDriver

  _defaultOpts: {port: null, baudrate: 115200, polling: true}
  _serialParser: serialport.parsers.raw
  _retryableResponseCodes: [0x80, 0x83, 0x88, 0x89, 0x8C]
  waitForHeaders: false

  _sendS3G: (payload) ->
    payload = new Buffer(payload) unless Buffer.isBuffer(payload)
    @_previousLine = payload
    packet = PacketBuilder.build payload

    console.log "\n-----------------------------------"
    console.log "Sending"
    console.log packet
    console.log "-----------------------------------\n"

    @serialPort.write packet

  _sendGCode: (gcode) ->
    payloads = @_interprettor.parse(gcode)
    @_sendS3G(payload) for payload in payloads

  _send: (data) ->
    if typeof(data) == "string"
      @_sendGCode data
    else
      @_sendS3G data

  sendS3G: (payload) ->
    @sendNow([payload], false)

  _onOpen: =>
    console.log "opened!"
    @_headersReceived = true
    # AbstractSerialDriver.prototype._onOpen.call(this)
    @sendS3G([1])
    # @_sendS3G([2])
    @sendS3G([142,
      0, 0,  0, 10,
      0, 0, 10,  0,
      0, 0,  0,  0,
      0, 0,  0,  0,
      0, 0,  0,  0
      0, 0,  0,  10,
      0
    ])
    setTimeout ( => console.log('wut'); @sendS3G([21]) ), 500

  _onData: (data) =>
    if @_response?
      @_response = Buffer.concat [@_response, data]
    else
      @_response = data
    return unless @_response.length > 2

    code = @_response.readUInt8(2)

    size = responseSizes[@_previousLine.readUInt8(0)] || 0
    size = size(@_previousLine) if typeof(size) == "function"
    console.log size + 4
    console.log @_response.length
    return if size + 4 > @_response.length

    # if _retryableResponseCodes.any(code)
    console.log "\n-----------------------------------"
    console.log "Received     code: #{code.toString(16)}"
    console.log "data:"
    console.log @_response
    console.log "-----------------------------------\n"
    @_response = null
    @_previousLine = null
    @_sendNextLine()

  _emitSendEvents: (l) ->


  _onSerialDisconnect: (p) =>
    return if @_killed or p.comName != @_comName
    @emit 'disconnect'
    @kill()

  _poll: () =>
    console.log "polling" if @verbose
    @_lastPoll = Date.now()
    #TODO: The actual polling bit

  kill: =>
    # TODO
