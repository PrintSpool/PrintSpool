serialport = require("serialport")
SerialPrinterDiscoverer = require '../serial_gcode_driver/serial_gcode_driver'
GCodeInterprettor = require './s3g_gcode_interprettor'
PacketBuilder = require './s3g_packet_builder'
AbstractSerialDriver = require '../abstract_serial_driver'

module.exports = class S3GDriver extends AbstractSerialDriver

  _defaultOpts: {port: null, baudrate: 115200, polling: true}
  _serialParser: serialport.parsers.raw
  _retryableResponseCodes: [0x80, 0x83, 0x88, 0x89, 0x8C]

  _sendS3G: (payload) ->
    console.log "sending?"
    packet = PacketBuilder.build new Buffer(payload)
    console.log "sending"
    console.log packet
    @serialPort.write packet

  _sendGCode: (gcode) ->
    payloads = @_interprettor.parse(gcode)
    @_sendS3G(payload) for payload in payloads

  _onOpen: =>
    # AbstractSerialDriver.prototype._onOpen.call(this)
    # @_sendS3G([1])
    @_sendS3G([2])

  _onData: (data) =>
    # code = data.readUInt8()
    # if _retryableResponseCodes.any(code)
    console.log "data:"
    console.log data

  _onSerialDisconnect: (p) =>
    return if @_killed or p.comName != @_comName
    @emit 'disconnect'
    @kill()

  sendNow: (gcode) =>
    # TODO: command queueing and all of that
    @_sendGCode(gcode)

  _poll: () =>
    console.log "polling" if @verbose
    @_lastPoll = Date.now()
    #TODO: The actual polling bit

  kill: =>
    # TODO
