PrintDriver = require("../lib/print_driver.coffee")
require 'sugar'

# Debugging
PrintDriver.listen()
PrintDriver.on "connect", (port) ->
  console.log "connected"
  printer = new PrintDriver(port)
  printer.verbose = true
  printer.print("M105\nM105")
  onComplete = ->
    console.log "exiting"
    printer.kill()
    PrintDriver.kill()
  printer.once "print_complete", onComplete

PrintDriver.on "disconnect", (p) -> console.log "disconnect"