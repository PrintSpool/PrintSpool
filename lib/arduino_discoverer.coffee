EventEmitter = require('events').EventEmitter
serialport = require("serialport")
require('sugar')

whiteList = /^\/dev\/(ttyUSB|ttyACM|tty\.|cu\.|rfcomm)/
blackList = /Bluetooth|FireFly/
ports = []
pnpRegex = /([0-9a-zA-Z]+)\-[a-zA-Z0-9]+$/
pollInterval = undefined

module.exports = self = new EventEmitter()

# Starts polling to watch for new serial ports
self.listen = ->
  # console.log "listen"
  setTimeout(poll, 0)
  pollInterval = setInterval(poll, 1000)

self.kill = ->
  self.removeAllListeners()
  clearInterval(pollInterval)

poll = ->
  serialport.list onList

onList = (err, listedPorts) ->
  update listedPorts.findAll(filter)

filter = (p) ->
  p.serialNumber ?= pnpRegex.exec(p.pnpId)?[1]
  return false if !p.serialNumber?
  return false if p.serialNumber.length == 0 and p.pnpId.length == 0
  p.comName.has(whiteList) and !(p.comName.has blackList)

update = (newPorts) ->
  previousPorts = ports
  ports = newPorts
  for p in previousPorts
    self.emit("disconnect", p) if newPorts.none( matcher.fill(p) )
  for p in newPorts
    self.emit("connect", p) if previousPorts.none( matcher.fill(p) )

matcher = (p1, p2) ->
  p1.comName == p2.comName
