ChildProcessDriverParent = require('./child_process/parent')

module.exports = build: (opts = {}) ->
  opts.driver = {type: opts.driver} if typeof(opts.driver) == 'string'
  opts.driver.fork ?= true

  if opts.driver.fork
    new ChildProcessDriverParent opts
  else
    type = opts.driver.type
    Driver = require "./#{type}_driver/#{type}_driver"
    new Driver opts
