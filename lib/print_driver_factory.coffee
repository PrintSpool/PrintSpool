module.exports =
  build: (opts = {}) ->
    (opts.driver ?= {}).type ?= "serial_gcode"
    type = opts.driver.type
    Driver = require "./drivers/#{type}_driver/#{type}_driver"
    new Driver opts
