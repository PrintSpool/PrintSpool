cp = require('child_process')
EventEmitter = require('events').EventEmitter

module.exports =
  build: (opts = {}) ->
    if typeof(opts.driver) == 'string'
      opts.driver = {type: opts.driver}
    opts.driver ?= {}
    opts.driver.type ?= "serial_gcode"
    opts.driver.fork_child_process ?= true

    if opts.driver.fork_child_process
      new ChildProcessDriver opts
    else
      type = opts.driver.type
      Driver = require "./drivers/#{type}_driver/#{type}_driver"
      new Driver opts


class ChildProcessDriver extends EventEmitter

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
    @_child = cp.fork('./lib/drivers/child_print_driver.coffee')

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

  _onError: =>
    @emit "disconnect"

  _addFnHandler: (fn) ->
    @[fn] = -> @_fnHandler(fn, arguments)

  _fnHandler: (fn, args) =>
    args = [].slice.call(args, 0)
    @_child.send(fn: fn, args: args)
