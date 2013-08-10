serialport = require("serialport")
SerialPort = serialport.SerialPort
EventEmitter = require('events').EventEmitter
util = require("util")
require("sugar")

module.exports = class PrintDriver extends EventEmitter
  @_whiteList = /^\/dev\/(ttyUSB|ttyACM|tty\.|cu\.|rfcomm)*/
  @_blackList = /Bluetooth|FireFly/
  @_ports = []

  # Starts polling to watch for new serial ports
  @listen: ->
    setTimeout(@_poll, 0)
    @_pollInterval = setInterval(@_poll, 1000)

  @kill: ->
    @removeAllListeners()
    clearInterval(@_pollInterval)

  @_poll: =>
    serialport.list (err, ports) => @_update ports.findAll(@_filter)

  @_filter: (p) =>
    p.comName.has(@_whiteList) and !p.comName.has(@_blackList)

  @_update: (ports) =>
    for p in ports.union(@_ports)
      @emit("connect", p) if @_ports.none(p)
      @emit("disconnect", p) if ports.none(p)
    @_ports = ports

  _greetings: /^(start|Grbl |ok|.*T:)/
  _comments: /;[^\n]*|\([^\n]*\)/g
  _opened: false
  _headersReceived: false
  verbose: false
  greetingTimeout: 2000
  # The previous line is set to null after an acknowledgment ("ok") is received
  _previousLine: null
  _nextLineNumber: 1
  # The gcode is set to either an array of gcode lines if printing or null otherwise
  _printJob: null
  _printJobLine: 0
  # Gcodes added via the sendNow function (like temperature polling)
  _sendNowQueue: []

  constructor: (port, baudrate = 115200, SP = SerialPort) ->
    @serialPort = new SP port.comName,
      baudrate: baudrate
      parser: serialport.parsers.readline("\n")
    .on("data", @_onData)
    .on("open", @_onOpen)

  _onOpen: =>
    @_opened = true
    console.log "opened" if @verbose
    @reset()

  reset: =>
    # @serialPort.setDTR(1)
    # setTimeout (-> @serialPort.setDTR(0)), 0.2
    @_headersReceived = false

  isPrinting: -> @_printJob? and @_headersReceived

  _isComplete: -> !@_printJob? or @_printJobLine == @_printJob.length

  isClearToSend: ->
    !@_previousLine? and @_headersReceived

  sendNow: (gcodes) =>
    @_sendNowQueue = @_sendNowQueue.concat(@_prepGCodes(gcodes))
    @_sendNextLine() if @isClearToSend()

  print: (printJob) =>
    @_printJobLine = 0
    @_printJob = @_prepGCodes(printJob)
    @_sendNextLine() if @isClearToSend()

  kill: ->
    @removeAllListeners()
    @serialPort.close()
    @serialPort.removeAllListeners()

  _prepGCodes: (gcode) ->
    if typeof(gcode) == "array"
      gcode = gcode.map (s) -> s.remove(@_comments)
    else if typeof(gcode) == "string"
      gcode = gcode.remove(@_comments).split('\n')
    else
      throw "gcode must either be an array of string or a string"
    # creating an array of lines without comments, whitespace or empy lines
    gcode.map((s)->s.compact()).compact(true)

  _onData: (line) =>
    console.log "received: #{line}" if @verbose
    return if line.startsWith("DEBUG_")
    @_parseTemperatureData()
    if !@_headersReceived and line.has(@_greetings)
      setTimeout @_onGreeting, @greetingTimeout
    else if line.startsWith("ok")
      @_previousLine = null
      @_sendNextLine()
      @_jobCompletionCheck()
    else if line.startsWith('Error')
      @emit("printer_error", line)
    else if line.toLowerCase().startsWith("resend") or line.startsWith("rs")
      lineNumber = parseInt(line.split(/N:|N|:/)[1])
      @_send(@_previousLine, lineNumber)

  _onGreeting: =>
    @_headersReceived = true
    @_sendNextLine()
    @emit("ready")

  _parseTemperatureData: ->
    # TODO

  _jobCompletionCheck: ->
    return unless @isPrinting() and @_isComplete()
    @emit "print_complete", @_printJob
    @_printJob = null

  _sendNextLine: ->
    if @_sendNowQueue.length > 0
      line = @_sendNowQueue.shift()
    else if @isPrinting() and !@_isComplete()
      line = @_printJob[@_printJobLine]
      @_printJobLine++
    else
      return
    @_send(line, @_nextLineNumber)

  _send: (line, lineNumber) ->
    @_previousLine = line
    @_nextLineNumber = lineNumber+1
    line = "N#{lineNumber} #{line}"
    checksum = 0
    checksum ^= line.charCodeAt(i) for i in [0..line.length]
    checksum &= 0xff
    @serialPort.write "#{line}*#{checksum}\n"
    console.log "sent: " + "#{line}*#{checksum}" if @verbose

# The PrintDriver object is it's self a event emitter for printer device 
# connect + disconnect events
Object.merge PrintDriver, EventEmitter.prototype
EventEmitter.call PrintDriver
