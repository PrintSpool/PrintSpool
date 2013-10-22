serialport = require("serialport")
SerialPort = serialport.SerialPort
EventEmitter = require('events').EventEmitter
util = require("util")
spawn = require('child_process').spawn
require("sugar")

module.exports = class PrintDriver extends EventEmitter
  @_whiteList = /^\/dev\/(ttyUSB|ttyACM|tty\.|cu\.|rfcomm)*/
  @_blackList = /Bluetooth|FireFly/
  @_ports = []
  @_pnpRegex = /([0-9a-zA-Z]+)\-[a-zA-Z0-9]+$/

  # Starts polling to watch for new serial ports
  @listen: ->
    # console.log "listen"
    setTimeout(@_poll, 0)
    @_pollInterval = setInterval(@_poll, 1000)

  @kill: ->
    @removeAllListeners()
    clearInterval(@_pollInterval)

  @_poll: =>
    serialport.list (err, ports) => @_update ports.findAll(@_filter)

  @_filter: (p) =>
    p.serialNumber ?= @_pnpRegex.exec(p.pnpId)?[1]
    return false if !p.serialNumber? or p.serialNumber.length == 0 and p.pnpId.length == 0 
    p.comName.has(@_whiteList) and !(p.comName.has @_blackList)

  @_update: (newPorts) =>
    previousPorts = @_ports
    @_ports = newPorts
    for p in previousPorts
      @emit("disconnect", p) if newPorts.none( @_matcher.fill(p) )
    for p in newPorts
      @emit("connect", p) if previousPorts.none( @_matcher.fill(p) )

  @_matcher = (p1, p2) ->
    p1.comName == p2.comName

  _defaultOpts: {port: null, baudrate: 115200, polling: true}
  _greetings: /^(start|grbl |ok|.*t:)/
  _comments: /;[^\n]*|\([^\n]*\)/g
  _opened: false
  _headersReceived: false
  verbose: false
  greetingTimeout: 2500
  pollingInterval: 700
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

  constructor: (opts = {}, SP = SerialPort) ->
    opts = Object.merge @_defaultOpts, opts
    @verbose ||= opts.verbose
    @_comName = opts.port.comName
    @_baudrate = opts.baudrate
    @serialPort = new SP opts.port.comName,
      baudrate: opts.baudrate
      parser: serialport.parsers.readline("\n")
      flowControl: false #true
    .on("data", @_onData)
    .on("open", @_onOpen)
    .on("error", @_onError)
    @serialPort.options.errorCallback = @_onSeriousError
    @startPolling() if @polling = opts.polling
    PrintDriver.on 'disconnect', @_onSerialDisconnect

  _onSerialDisconnect: (p) =>
    return if @_killed or p.comName != @_comName
    @emit 'disconnect'
    @kill()

  startPolling: ->
    @on "change", @_receivePollResponse
    @_poll()

  _poll: () =>
    console.log "polling" if @verbose
    @_lastPoll = Date.now()
    @sendNow "M105"

  _receivePollResponse: (data) =>
    return if !@_lastPoll? or Object.values(data).none (d) -> d.current_temp?
    return if @_blockers.length > 0
    nextPollTime = Math.max 0, @_lastPoll + @pollingInterval - Date.now()
    @_lastPoll = null
    # Requesting a temperature update from the printer in nextPollTime ms
    @_pollingTimeout = setTimeout @_poll, nextPollTime

  _onOpen: =>
    @_opened = true
    console.log "opened" if @verbose
    @_cliReset()
    @_headersReceived = false

  _onError: (err) =>
    console.log err if @verbose

  _onSeriousError: (err) =>
    console.log err if @verbose
    @emit 'disconnect'

  reset: =>
    @_cliReset()
    @_printJob = null
    @_printJobLine = 0
    @_headersReceived = false

  _cliReset: () =>
    args = [@_comName, @_baudrate]
    proc = spawn("#{__dirname}/../bin/arduino_reset", args)
    proc.stdout.on 'data', (data) => console.log('stdout: ' + data) if @verbose
    proc.stderr.on 'data', (data) => console.log('stderr: ' + data) if @verbose
    proc.on 'close', (code) =>
      console.log('reset exited with code ' + code) if @verbose

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
    return if @_killed
    @_killed = true
    console.log "Killing the print driver" if @verbose
    clearTimeout @_pollingTimeout if @_pollingTimeout?
    PrintDriver.removeListener 'disconnect', @_onSerialDisconnect
    @removeAllListeners()
    @serialPort.close => @serialPort.removeAllListeners()

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
    originalLine = line
    line = line.toLowerCase()
    if !@_headersReceived and line.has(@_greetings)
      setTimeout @_onGreeting, @greetingTimeout
    else if line.startsWith("ok")
      @_previousLine = null
      @_sendNextLine()
      @_jobCompletionCheck()
    else if line.toLowerCase().startsWith("resend") or line.startsWith("rs")
      lineNumber = parseInt(line.split(/N:|N|:/)[1])
      @_send(@_previousLine, lineNumber)
    @_emitReceiveEvents(line, originalLine) unless line.startsWith("echo:")

  _onGreeting: =>
    @_headersReceived = true
    @_nextLineNumber = 1
    @_sendNextLine()
    @emit("ready")

  # Parse a line of gcode response from the printer and emit printer errors and 
  # current_temp, target_temp_countown and blocking changes
  _emitReceiveEvents: (l, originalLine) ->
    data = {}
    # console.log l
    # Parsing temperatures
    if l.has "t:"
      # Filtering out non-temperature values
      temps = l.remove(/(\/|[a-z]*@:|e:)[0-9\.]*|ok/g)
      # Normalizing the input
      temps = temps.replace("t:", "e0:").replace(/:[\s\t]*/g, ':')
      # Adds a temperature to a object of { KEY: {current_temp: VALUE}, ... }
      addToHash = (h, t) -> h[t[0]] = {current_temp: parseFloat(t[1])}; h
      # Construct that obj containing key-mapped current temps
      data = temps.words().map((s)->s.split(":")).reduce addToHash, {}
    # Parsing "w" temperature countdown values
    # see: http://git.io/FEACGw or google "TEMP_RESIDENCY_TIME"
    w = data.w?.current_temp
    if w? and w != "?"
      w = parseFloat(w)*1000
      (data[k] ?= {}).target_temp_countdown = w for k in @_blockers
      delete data['w']
    # Parsing ok's and removing blockers
    if l.has "ok"
      (data[k] ?= {}).blocking = false for k in @_blockers
      @_blockers = []
    # Fire the current temperature and target temp countdown changes
    # console.log data
    @emit("change", data) if data?
    @emit("printer_error", originalLine) if l.startsWith('error')

  # Parse a line of gcode sent to the printer and emit blocking and target_temp
  # changes
  _emitSendEvents: (l) ->
    data = {}
    # Monitor the sent commands for new extruder target temperatures
    if l.has /M109|M104|M140|M190/
      temp = parseFloat(/S([0-9]+)/.exec(l)?[1] || '0')
      if l.has /M109|M104/
        target = "e" + ( /\ P([0-9]+)/.exec(l)?[1] || '0')
      else
        target = "b"
      data[target] = {target_temp: temp}
    # Parsing the sent command for blocking operations
    if l.has /M109|M190|M116/
      target = "e0" if l.has 'M116'
      (data[target] ?= {}).blocking = true
      @_blockers.push target if @_blockers.none(target)
    # Firing a notification of the target_temp and blocking changes
    @emit "change", data if Object.size(data) > 0

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
      printJobLine = true
    else
      return
    @_send(line, @_nextLineNumber)
    @_emitSendEvents(line)
    @emit "print_job_line_sent" if printJobLine?

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
