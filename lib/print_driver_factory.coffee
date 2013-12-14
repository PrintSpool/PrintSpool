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

  constructor: (opts) ->
    @_child = cp.fork('./drivers/child_print_driver')

    @_child.on 'message', (m) ->
      console.log('received: ' + m)
      @emit m.event, m.data

    @[fn] = => @_fnHandler(fn, arguments) for fn in @_fns

    @_child.send(opts)

  _fnHandler: (fn, args) ->
    args = Array.slice(args)
    @_child.send(fn: fn, args: args)
