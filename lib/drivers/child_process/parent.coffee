EventEmitter = require('events').EventEmitter
cp = require('child_process')

module.exports = class ChildProcessDriverParent extends EventEmitter

  _fns: [
    'reset',
    'kill',
    'sendNow',
    'print',
    'isPrinting',
    'isClearToSend',
    'startPolling'
  ]

  constructor: (@_opts) ->
    @_child = cp.fork('./lib/drivers/child_process/child.js')

    @_child
    .once("message", @_onInit)
    .on("error", @_onError)

    @_addFnHandler(fn) for fn in @_fns

  _onInit: =>
    @_child.on('message', @_onMessage)
    @_child.send(@_opts)

  _onMessage: (m) =>
    # console.log('received: ')
    # console.log(m)
    @emit m.event, m.data

  _onError: (e) =>
    console.log "Child Process Error: #{e}"
    try @_child.kill("KILL")
    try @_child.removeAllListeners()
    @emit "disconnect"

  _addFnHandler: (fn) ->
    @[fn] = -> @_fnHandler(fn, arguments)

  _fnHandler: (fn, args) =>
    args = [].slice.call(args, 0)
    @_child.send(fn: fn, args: args)
