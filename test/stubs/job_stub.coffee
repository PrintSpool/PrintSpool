EventEmitter = require('events').EventEmitter

nextID = 0
module.exports = class JobStub extends EventEmitter
  defaults:
    type: "job"
    status: "idle"
    qtyPrinted: 0
    qty: 1
    startTime: new Date()

  constructor: (attrs, cb) ->
    @[k] = v for k, v of @defaults
    @[k] = v for k, v of attrs
    @key = "job_stub_#{nextID++}"
    Object.defineProperty @, 'components', value: [@]
    setImmediate => cb(@)

  loadGCode: (opts, cb) -> setImmediate ->
    cb null, 'G91\nG1 F300\nG1 X10 Y20 Z5 F300'

  beforeDelete: ->
