EventEmitter = require('events').EventEmitter
chai = require("chai")
spies = require('chai-spies')
chai.use(spies)

module.exports = class DriverStub extends EventEmitter
  constructor: ->
    # Stub all the things!
    ['reset', 'sendNow', 'print'].each (key) =>
      @[key] = chai.spy (a,b) -> @emit("test_#{key}", a, b)
