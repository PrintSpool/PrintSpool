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

  reset: ->

  kill: ->
    @removeAllListeners()
    clearInterval @_interval if @_pollingInterval?

  sendNow: (gcode) ->

  print: (@_printJob) ->
    setTimeout @_finishPrint, 4000

  _finishPrint: =>
    @emit "print_complete", @_printJob

  isPrinting: -> false

  isClearToSend: -> true

  _startPolling: ->
    console.log "polling"
    @_interval = setInterval @_poll, @_pollingInterval

  _poll: =>
    data =
      e0: {current_temp: Math.random()*40 + 20}
      b: {current_temp: Math.random()*20 + 20}
    @emit("change", data) if data?
