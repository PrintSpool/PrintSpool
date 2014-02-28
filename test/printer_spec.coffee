chai = require("chai")
spies = require('chai-spies')
require("sugar")
_ = require 'lodash'

Printer       = require("../lib/printer.coffee")
Config        = require("../lib/config.coffee")
PartStub  = require("./stubs/part_stub.coffee")
DriverStub    = require("./stubs/driver_stub.coffee")

chai.use(spies)
chai.should()
expect = chai.expect

describe 'Printer', ->
  driver = null
  printer = null
  config = null

  beforeEach ->
    driver  = new DriverStub()
    initPrinter()

  initPrinter = (opts={}) ->
    config = new Config opts
    printer = new Printer driver, config, PartStub

  addPart = (done, opts = {}) ->
    printer.once 'add', -> done?()
    opts.filePath = "#{__dirname}/assets/test.gcode"
    printer.add opts

  partKey = (i=0) ->
    _.pluck(printer.parts, "key").sort()[i]

  set = (key, attrs) ->
    namespaced = {}
    namespaced[key] = attrs
    printer.set namespaced

  receiveWelcome = ->
    driver.emit "ready"

  completePrint = (cb) ->
    setImmediate ->
      printer.once 'change', cb if cb?
      driver.emit "print_complete", printer.parts[0]

  describe 'add', ->

    it 'should store the part in the queue', (done) ->
      addPart ->
        printer.parts.length.should.equal 1
        done()

    it 'should set the qty', (done) ->
      cb = ->
        printer.parts[0].qty.should.equal 5
        done()
      addPart cb, qty: 5

    it 'should emit add', (done) ->
      printer.add {}
      printer.on 'add', -> done()

    it 'should place the first part at the start of the queue', (done) ->
      addPart ->
        printer.parts[0].position.should.equal 0
        done()

    it 'should place the part at the end of the queue by default', (done) ->
      addPart() for i in [0..1]
      printer.on 'add', ->
        return unless printer.parts.length == 2
        printer.parts[1].position.should.equal 1
        done()

  describe 'rm', ->
    beforeEach addPart

    it 'should remove an existing part without error and emit rm', (done) ->
      printer.on 'rm', -> done()
      printer.rm partKey()

    it 'should error if the part does not exist', ->
      printer.rm.bind(printer, "moocow").should.throw()

  describe 'estop', ->
    beforeEach ->
      receiveWelcome()

    it 'should reset the printer', ->
      printer.estop()
      driver.reset.should.be.called.once()

    it 'should set the status to estopped', (done) ->
      printer.on 'change', (data) ->
        data.state.status.should.equal 'estopped'
        done()
      printer.estop()

    it 'should error on other commands once estopped', ->
      printer.estop()
      printer.move.bind(x: 10).should.throw()

    it 'should estop the current print', (done) ->
      i = 0
      addPart -> printer.print()
      printer.on 'change', (data) ->
        switch i++
          when 0 then printer.estop()
          when 1 then onEstopped data
      onEstopped = (data) ->
        expect(data?[partKey()]?.status).to.equal 'estopped'
        done()

  describe 'print', ->
    beforeEach (done) ->
      receiveWelcome()
      addPart(done)

    it 'should print if the printer is idle', (done) ->
      driver.on 'test_print', (gcode) ->
        expect(gcode).to.equal 'G91\nG1 F300\nG1 X10 Y20 Z5 F300'
        done()
      printer.print()

    it 'should change the printer\'s status to printing', (done) ->
      printer.on 'change', (data) ->
        expect(data.state?.status).to.equal 'printing'
        done()
      printer.print()

    it 'should change the part\'s status to printing', (done) ->
      printer.on 'change', (data) ->
        expect(data[partKey()]?.status).to.equal 'printing'
        done()
      printer.print()

    it 'should change the printer\'s status to idle after the print', (done) ->
      printer.print()
      i = 0
      completePrint (data) ->
        expect(data.state?.status).to.equal 'idle'
        done()

    it 'should print continuously if pause_between_prints is false', (done) ->
      config.$.set "pauseBetweenPrints", false
      # Adding a second part (see before each)
      addPart ->
        printer.print()
        completePrint onComplete
      onComplete = (data) ->
        expect(data[partKey()]?.status).to.equal 'done'
        expect(data.state?.status).to.equal undefined
        expect(printer.status).to.equal "printing"
        done()

  describe 'print (w/ qty)', ->
    beforeEach (done) ->
      receiveWelcome()
      addPart done, qty: 3

    it 'should print 3 copies continuously if qty is 3', (done) ->
      config.$.set "pauseBetweenPrints", false
      printer.print()
      onComplete = (data) ->
        return completePrint(onComplete) if printer.parts[0].qtyPrinted != 3
        data[partKey()].status.should.equal 'done'
        printer.status.should.equal 'idle'
        done()
      completePrint(onComplete)

    it 'should print 3 copies with pauses if qty is 3', (done) ->
      iterate = (data) ->
        if printer.parts[0].qtyPrinted != 3
          printer.print()
          return completePrint(iterate)
        data[partKey()].status.should.equal 'done'
        printer.status.should.equal 'idle'
        done()
      iterate()

  describe 'move', ->
    beforeEach receiveWelcome

    it 'should move the printer at z_feedrate on z', (done) ->
      driver.on 'test_sendNow', (gcode) ->
        gcode.should.equal 'G91\nG1 F300\nG1 X10 Y20 Z5 F300'
        done()
      printer.move(x: 10, y:20, z: 5)

    it 'should move the printer at x_feedrate on xy', (done) ->
      driver.on 'test_sendNow', (gcode) ->
        gcode.should.equal 'G91\nG1 F3000\nG1 X10 Y20 F3000'
        done()
      printer.move(x: 10, y:20)

    it 'should not move the printer on bad axes', ->
      printer.move.bind(e7: 10).should.throw()

    it 'should move the printer at the correct flowrate on e0', (done) ->
      driver.on 'test_sendNow', (gcode) ->
        gcode.should.equal 'T0\nG91\nG1 F40\nG1 E10 F40'
        done()
      printer.move e0: 10

    it "should not move the printer when it's estopped or printing", (done) ->
      addPart -> printer.print()
      fn = printer.move.bind(e0: 10)
      driver.on 'test_print', _.partial setImmediate, ->
        expect(printer.status).to.equal "printing"
        expect(fn).to.throw()
        printer.estop()
        expect(printer.status).to.equal "estopped"
        expect(fn).to.throw()
        done()

  describe 'move (w/ multiple extruders)', ->
    beforeEach receiveWelcome

    it 'should move the printer at the correct flowrate on e1', (done) ->
      driver.on 'test_sendNow', (gcode) ->
        gcode.should.equal 'T1\nG91\nG1 F40\nG1 E10 F40'
        done()
      config.$.$merge components: {e1: 'heater'}
      setImmediate -> printer.move e1: 10

  describe 'home', ->
    beforeEach (done) ->
      receiveWelcome()
      addPart(done)

    it 'should home the printer if it\'s idle', (done) ->
      driver.on 'test_sendNow', (gcode) ->
        gcode.should.equal 'G28 X Y Z'
        done()
      printer.home()

    it 'should home only the axes specified', (done) ->
      driver.on 'test_sendNow', (gcode) ->
        gcode.should.equal 'G28 X Y'
        done()
      printer.home(['x', 'y'])

    it 'should not home if the printer isn\'t idle', ->
      printer.print()
      printer.home.should.throw()

    it 'should throw an error if a invalid axis is given', ->
      printer.home.bind(printer, ['k']).should.throw()

  describe 'set', ->
    it 'should set a attribute on the printer'

    it 'shound not set a attribute if it doesn\'t exist'

    it 'should not change the type of a attribute'

    it 'should modify an existing part and emit change', (done) ->
      printer.on 'change', (data) ->
        data[partKey()].qty.should.equal 5
        done()
      addPart ->
        set partKey(0), qty: 5

    it 'should move a part and reorder other parts around it', (done) ->
      printer.on 'change', (data) ->
        data.should.not.have.property partKey(i) for i in [0, 3]
        data.should.have.property partKey(i)    for i in [1, 2]
        data[partKey(2)].position.should.equal 1
        data[partKey(1)].position.should.equal 2
        done()
      printer.add {} for i in [0..3]
      setImmediate -> set partKey(1), {position: 2}

    it 'should move a part to position 0 and move all parts down', (done) ->
      printer.on 'change', (data) ->
        expect(data[partKey(1)]?.position).to.equal 0
        expect(data[partKey(0)]?.position).to.equal 1
        done()
      addPart() for i in [0..1]
      setImmediate -> set partKey(1), position: 0

    it 'should error if a invalid part id is given', ->
      fn = set.bind undefined, "foobar", qty: 5, position: 0
      fn.should.throw()

    it 'should error if a invalid position is given', ->
      fn = set.bind undefined, partKey(0), position: 1
      addPart -> fn.should.throw()

    it 'should error if a negative qty is given', ->
      fn = set.bind undefined, partKey(0), qty: -5
      addPart -> fn.should.throw()

  describe "set", ->
    part = undefined
    beforeEach (done) ->
      receiveWelcome()
      addPart -> addPart ->
        part = printer.parts[0]
        printer.print()
      driver.on 'test_print', _.partial setImmediate, -> done()

    # A clousure to add a reposition / bad status test for part components
    addTest = (status) -> it "should error repositioning a #{status} part", ->
        fn = set.bind undefined, part?.key, position: 1
        printer.estop() if status == "estopped"
        expect(part?.status).to.equal status
        expect(fn).to.throw()
    addTest(status) for status in ['estopped', 'printing']

    it "should not move a idle part above a printing one", ->
      fn = set.bind undefined, printer.parts[1]?.key, position: 0
      expect(fn).to.throw()

