EventEmitter = require('events').EventEmitter

# A driver that does nothing. For development purposes only.
module.exports = class NullDriver extends EventEmitter
  verbose: false
  _pollingInterval: 700

  constructor: ->
    setTimeout @_init, 0

  _init: =>
    @emit("ready")
    @_startPolling()

  reset: =>
    clearTimeout @_printTimeout if @_printTimeout?
    @_printTimeout = null
    setTimeout ( => @emit("ready") ), 1000

  kill: ->
    @emit 'disconnect'
    @removeAllListeners()
    clearInterval @_interval if @_pollingInterval?

  sendNow: (gcode) ->
    console.log "Null Driver Debug: #{line}" for line in gcode.split("\n")

  print: (gcodes) ->
    gcodes = gcodes.split("\n") if typeof gcodes != "array"
    console.log "Null Driver Debug: Printing"
    console.log gcodes[0..10]
    console.log "..."
    # @_printTimeout = setTimeout @_finishPrint, 4000

  _finishPrint: =>
    console.log "Null Driver Debug: Done Printing"
    @emit "print_complete"

  isPrinting: -> false

  isClearToSend: -> true

  _startPolling: ->
    # console.log "polling"
    @_interval = setInterval @_poll, @_pollingInterval

  _poll: =>
    data =
      e0: {current_temp: Math.random()*40 + 20}
      b: {current_temp: Math.random()*20 + 20}
    @emit("change", data) if data?
