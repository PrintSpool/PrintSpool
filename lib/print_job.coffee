
module.exports = class PrintJob
  constructor: (opts) ->
    @[k] = v for k, v of opts
