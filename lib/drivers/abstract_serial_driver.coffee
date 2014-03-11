EventEmitter = require('events').EventEmitter
serialport = require("serialport")
SerialPort = serialport.SerialPort
spawn = require('child_process').spawn
ArudinoDiscoverer = require("../arduino_discoverer")

module.exports = class AbstractSerialDriver extends EventEmitter
  _comments: /;[^\n]*|\([^\n]*\)/g

  _opened: false
  # TODO: This should be more abstractly whether the printer is ready to print or not
  _headersReceived: false
  # The previous line is set to null after an acknowledgment ("ok") is received
  _previousLine: null
  _nextLineNumber: 1
  # The gcode is set to either an array of gcode lines if printing or null otherwise
  _printJob: null
  _printJobLine: 0
  # Gcodes added via the sendNow function (like temperature polling)
  _sendNowQueue: []
  # An array of extruders and beds that the printer is waiting for to reach temp
  _blockers: []

  verbose: false
  waitForHeaders: true
  pollingInterval: 700

  constructor: (opts = {}, SP = SerialPort) ->
    @opts = Object.merge (@_defaultOpts||{}), opts
    @verbose ||= @opts.verbose
    @_comName = @opts.port.comName
    @_baudrate = @opts.driver.baudrate || @opts.baudrate
    console.log @_baudrate if @verbose
    @serialPort = new SP @_comName,
      baudrate: @_baudrate
      parser: @_serialParser
      flowControl: true
    .on("data", @_onData)
    .on("open", @_onOpen)
    .on("error", @_onError)
    @serialPort.options.errorCallback = @_onSeriousError
    @startPolling() if @polling = @opts.polling
    ArudinoDiscoverer.on 'disconnect', @_onSerialDisconnect

  reset: =>
    @_cliReset()
    @_printJob = null
    @_printJobLine = 0
    @_headersReceived = false

  _cliReset: () =>
    args = [@_comName, @_baudrate]
    proc = spawn("#{__dirname}/../../bin/arduino_reset", args)
    proc.stdout.on 'data', (data) => console.log('stdout: ' + data) if @verbose
    proc.stderr.on 'data', (data) => console.log('stderr: ' + data) if @verbose
    proc.on 'close', (code) =>
      console.log('reset exited with code ' + code) if @verbose

  _onOpen: =>
    @_opened = true
    console.log "opened" if @verbose
    @_cliReset()
    @_headersReceived = (@waitForHeaders == false)

  _onError: (err) =>
    console.log err if @verbose

  _onSeriousError: (err) =>
    console.log err if @verbose
    @emit 'disconnect'

  _onSerialDisconnect: (p) =>
    return if @_killed or p.comName != @_comName
    @emit 'disconnect'
    @kill()

  startPolling: ->
    @on "change", @_receivePollResponse
    @_poll()

  _receivePollResponse: (data) =>
    return if !@_lastPoll? or Object.values(data).none (d) -> d.current_temp?
    return if @_blockers.length > 0
    nextPollTime = Math.max 0, @_lastPoll + @pollingInterval - Date.now()
    @_lastPoll = null
    # Requesting a temperature update from the printer in nextPollTime ms
    @_pollingTimeout = setTimeout @_poll, nextPollTime

  kill: ->
    return if @_killed
    @_killed = true
    console.log "Killing the print driver" if @verbose
    clearTimeout @_pollingTimeout if @_pollingTimeout?
    ArudinoDiscoverer.removeListener 'disconnect', @_onSerialDisconnect
    @removeAllListeners()
    @serialPort.close => @serialPort.removeAllListeners()

  sendNow: (gcodes, prep = true) =>
    gcodes = @_prepGCodes(gcodes) if prep == true
    @_sendNowQueue = @_sendNowQueue.concat(gcodes)
    @_sendNextLine() if @isClearToSend()

  print: (printJob) =>
    @_printJobLine = 0
    @_printJob = @_prepGCodes(printJob)
    @_sendNextLine() if @isClearToSend()

  _prepGCodes: (gcode) ->
    if typeof(gcode) == "array"
      gcode = gcode.map (s) -> s.remove(@_comments)
    else if typeof(gcode) == "string"
      gcode = gcode.remove(@_comments).split('\n')
    else
      throw "gcode must either be an array of string or a string"
    # creating an array of lines without comments, whitespace or empy lines
    gcode.map((s)->s.compact()).compact(true)

  _sendNextLine: ->
    if @_sendNowQueue.length > 0
      line = @_sendNowQueue.shift()
    else if @isPrinting() and !@_isComplete()
      line = @_printJob[@_printJobLine]
      @_printJobLine++
      printJobLine = true
    else
      return
    @_send(line, @_nextLineNumber)
    @_emitSendEvents(line)
    # Rate limited print job line events (1 per 100ms)
    now = Date.now()
    return unless printJobLine? and (@_lastPrintLineEvent || 0) < now - 100
    @_lastPrintLineEvent = now
    @_lastPrintLineEvent
    @emit "print_job_line_sent"

  _jobCompletionCheck: ->
    return unless @isPrinting() and @_isComplete()
    @emit "print_complete", @_printJob
    @_printJob = null

  isClearToSend: ->
    !@_previousLine? and @_headersReceived

  isPrinting: -> @_printJob? and @_headersReceived

  _isComplete: -> !@_printJob? or @_printJobLine == @_printJob.length
