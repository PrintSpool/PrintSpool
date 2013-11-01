module.exports =
  build: (opts = {}) ->
    if typeof(opts.driver) == 'string'
      opts.driver = {type: opts.driver}
    (opts.driver ?= {}).type ?= "serial_gcode"
    type = opts.driver.type
    Driver = require "./drivers/#{type}_driver/#{type}_driver"
    new Driver opts
