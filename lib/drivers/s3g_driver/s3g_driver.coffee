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
    # console.log payload
    payload = new Buffer(payload) unless Buffer.isBuffer(payload)
    @_previousLine = payload
    packet = PacketBuilder.build payload

    if @verbose
      console.log "\n-----------------------------------"
      console.log "Sending"
      console.log payload
      console.log packet
      console.log "-----------------------------------\n"

    @serialPort.write packet

  _sendGCode: (gcode) ->
    payloads = GCodeInterprettor.parse(gcode, @_state)
    if payloads.length > 0
      @_sendS3G(payloads.shift())
      @_sendNowQueue.unshift(payload) for payload in payloads
    else
      @_sendNextLine()

  _send: (data) ->
    if typeof(data) == "string"
      @_sendGCode data
    else
      @_sendS3G data

  sendS3G: (payload) ->
    @sendNow([payload], false)

  _onOpen: =>
    console.log "opened!"
    @_state = @opts.driver
    @_state.feedrate = 300
    @_state.unitsMultiplier = 1
    @_state.tool = 0
    # AbstractSerialDriver.prototype._onOpen.call(this)

    # Request the machine version number
    payload = new Buffer(3)
    payload.writeUInt8(0, 0)
    payload.writeUInt16LE(40, 1)
    @_sendS3G(payload)
    # @_sendS3G([2])

    # payload = new Buffer(2+6*4)
    # i = 0
    # payload.writeUInt8(142, i)
    # i++
    # payload.writeInt32LE(-2000, i) # X (in steps)
    # i+= 4
    # payload.writeInt32LE(0, i) # Y
    # i+= 4
    # payload.writeInt32LE(0, i)   # Z
    # i+= 4
    # payload.writeInt32LE(0, i)   # A
    # i+= 4
    # payload.writeInt32LE(0, i)   # B
    # i+= 4
    # payload.writeUInt32LE(1000*1000, i) # Durration in ms
    # i+= 4
    # payload.writeUInt8(0xFF, i)

    # @sendS3G(payload)
    # setTimeout ( => console.log('wut'); @sendS3G([21]) ), 500

    # @sendNow('g1 x100')

  _onData: (data) =>
    if @_response?
      @_response = Buffer.concat [@_response, data]
    else
      @_response = data
    return unless @_response.length > 2

    code = @_response.readUInt8(2)
    cmd = @_previousLine.readUInt8(0)

    # Retry on error response
    if code != 0x81
      return @_sendS3G(@_previousLine) if @_retryableResponseCodes.any(code)
      @emit "error", new Error "S3G Error Code: 0x#{code.toString(16)}"
      @_response = null

    size = responseSizes[cmd] || 0
    size = size(@_previousLine) if typeof(size) == "function"

    # Wait for the full packet to be sent if it is not an error
    return if size + 4 > @_response.length

    if cmd == 10
      toolheadId = @_previousLine.readUInt8(1) 
      toolheadCmd = @_previousLine.readUInt8(2)
    else
      console.log "expected: #{size + 4}"
      console.log "actual: #{@_response.length}"
      console.log @_response

    # Mark the printer as ready once the first ack has been received
    if !@_headersReceived
      @_headersReceived = true
      @emit("ready")


    payload = @_response.slice(3, -1)
    @_emitReceiveEvents(cmd, toolheadCmd, toolheadId, payload)

    # Verbose output
    if @verbose
      console.log "\n-----------------------------------"
      console.log "Received     code: #{code.toString(16)}"
      console.log "data:"
      console.log @_response
      console.log "-----------------------------------\n"
    # Clearing everything for the next line
    @_response = null
    @_previousLine = null
    @_sendNextLine()

  _emitReceiveEvents: (code, toolheadCode, toolheadId, res) ->
    data = {}
    if code == 10 and toolheadCode = 2
      currentTemp = res.readUInt16LE(0)
      data["e#{toolheadId}"] = current_temp: currentTemp
      # console.log "Temperature: #{currentTemp}"
    @emit 'change', data

  _emitSendEvents: (l) ->
    # console.log l


  _onSerialDisconnect: (p) =>
    return if @_killed or p.comName != @_comName
    @emit 'disconnect'
    @kill()

  _poll: =>
    console.log "polling" if @verbose
    @_lastPoll = Date.now()
    @sendS3G([10, 0, 2])

  kill: =>
    # TODO
