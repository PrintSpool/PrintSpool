serialport = require("serialport")
SerialPort = serialport.SerialPort
util = require("util")
require("sugar")
AbstractSerialDriver = require '../abstract_serial_driver'

module.exports = class PrintDriver extends AbstractSerialDriver

  _defaultOpts: {port: null, baudrate: 115200, polling: true}
  _serialParser: serialport.parsers.readline("\n")
  _greetings: /^(start|grbl |ok|.*t:)/

  greetingTimeout: 2500

  _poll: () =>
    console.log "#{@_comName} polling" if @verbose
    @_lastPoll = Date.now()
    @sendNow "M105"

  _onData: (line) =>
    console.log "#{@_comName} received: #{line}" if @verbose
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
      data = temps.words()
      .map((s)->s.split(":"))
      .filter((t)->t[0].length > 0)
      .reduce addToHash, {}
    # Parsing "w" temperature countdown values
    # see: http://git.io/FEACGw or google "TEMP_RESIDENCY_TIME"
    w = parseFloat(data.w?.current_temp)*1000
    if w? and w != NaN
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

  _send: (line, lineNumber) ->
    @_previousLine = line
    @_nextLineNumber = lineNumber+1
    line = "N#{lineNumber} #{line}"
    checksum = 0
    checksum ^= line.charCodeAt(i) for i in [0..line.length]
    checksum &= 0xff
    @serialPort.write "#{line}*#{checksum}\n"
    console.log "#{@_comName} sent: " + "#{line}*#{checksum}" if @verbose
