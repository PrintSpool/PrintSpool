factory = require "../print_driver_factory.coffee"
driver = null
events = ['ready', 'change', 'printer_error']

# console.log process

process.once 'message', (opts) ->
  opts.driver.fork_child_process = false
  driver = factory.build opts
  process.on 'message', onMessage
  
  addEventListener(k) for k in events

addEventListener = (k) ->
  driver.on k, (data) -> onEvent k, data

onMessage = (msg) ->
  # console.log msg
  driver[msg.fn](msg.args)

onEvent = (event, data) ->
  process.send event: event, data: data

process.send event: "child_process_initialize"
