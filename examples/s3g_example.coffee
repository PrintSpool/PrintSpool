path = require ("flavored-path")
Driver = require("../lib/drivers/s3g_driver/s3g_driver")
ArudinoDiscoverer = require("../lib/arduino_discoverer")

# TOM
baudrate = 115200

# Gen 3
# baudrate = 38400

ArudinoDiscoverer.listen()
ArudinoDiscoverer.on "connect", (port) ->
  console.log port.comName
  driver = new Driver(verbose: true, port: port, baudrate: baudrate)

