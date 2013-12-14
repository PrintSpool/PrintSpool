factory = require "../print_driver_factory.coffee"
driver = null
events = ['ready', 'change', 'printer_error']

process.once 'message', (opts) ->
  opts.driver.fork_child_process = false
  driver = factory.build opts
  process.on 'message', onMessage
  
  driver.on k, (data) -> onEvent k, data for k in events

onMessage = (msg) ->
  driver[msg.fn](msg.args)

onEvent = (event, data) ->
  process.send event: event, data: data
