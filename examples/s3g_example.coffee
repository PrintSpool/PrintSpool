path = require ("flavored-path")
Driver = require("../lib/drivers/s3g_driver/s3g_driver")
ArudinoDiscoverer = require("../lib/arduino_discoverer")

ArudinoDiscoverer.listen()
ArudinoDiscoverer.on "connect", (port) ->
  console.log port.comName
  driver = new Driver(verbose: true, port: port, baudrate: 38400)

