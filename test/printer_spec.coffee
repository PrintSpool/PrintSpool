chai = require("chai")
spies = require('chai-spies')
require("sugar")
_ = require 'lodash'

Printer       = require("../lib/printer.coffee")
Config        = require("../lib/config.coffee")
PrintJobStub  = require("./stubs/job_stub.coffee")
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
    printer = new Printer driver, config, PrintJobStub

  addJob = (done, opts = {}) ->
    printer.once 'add', -> done?()
    opts.filePath = "#{__dirname}/assets/test.gcode"
    printer.addJob opts

  jobKey = (i=0) ->
    _.pluck(printer.jobs, "key").sort()[i]

  set = (key, attrs) ->
    namespaced = {}
    namespaced[key] = attrs
    printer.set namespaced


  receiveWelcome = ->
    driver.emit "ready"

  completePrint = (cb) ->
    setImmediate ->
      printer.once 'change', cb if cb?
      driver.emit "print_complete", printer.jobs[0]

  describe 'addJob', ->

    it 'should store the job in the queue', (done) ->
      addJob ->
        printer.jobs.length.should.equal 1
        done()

    it 'should set the qty', (done) ->
      cb = ->
        printer.jobs[0].qty.should.equal 5
        done()
      addJob cb, qty: 5

    it 'should emit add', (done) ->
      printer.addJob {}
      printer.on 'add', -> done()

    it 'should place the first job at the start of the queue', (done) ->
      addJob ->
        printer.jobs[0].position.should.equal 0
        done()

    it 'should place the job at the end of the queue by default', (done) ->
      addJob() for i in [0..1]
      printer.on 'add', ->
        return unless printer.jobs.length == 2
        printer.jobs[1].position.should.equal 1
        done()

  describe 'rm', ->
    beforeEach addJob

    it 'should remove an existing job without error and emit rm', (done) ->
      printer.on 'rm', -> done()
      printer.rm jobKey()

    it 'should error if the job does not exist', ->
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
      addJob -> printer.print()
      printer.on 'change', (data) ->
        switch i++
          when 0 then printer.estop()
          when 1 then onEstopped data
      onEstopped = (data) ->
        expect(data?[jobKey()]?.status).to.equal 'estopped'
        done()

  describe 'print', ->
    beforeEach (done) ->
      receiveWelcome()
      addJob(done)

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

    it 'should change the job\'s status to printing', (done) ->
      printer.on 'change', (data) ->
        expect(data[jobKey()]?.status).to.equal 'printing'
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
      # Adding a second job (see before each)
      addJob ->
        printer.print()
        completePrint onComplete
      onComplete = (data) ->
        expect(data[jobKey()]?.status).to.equal 'done'
        expect(data.state?.status).to.equal undefined
        expect(printer.status).to.equal "printing"
        done()

  describe 'print (w/ qty)', ->
    beforeEach (done) ->
      receiveWelcome()
      addJob done, qty: 3

    it 'should print 3 copies continuously if qty is 3', (done) ->
      config.$.set "pauseBetweenPrints", false
      printer.print()
      onComplete = (data) ->
        return completePrint(onComplete) if printer.jobs[0].qtyPrinted != 3
        data[jobKey()].status.should.equal 'done'
        printer.status.should.equal 'idle'
        done()
      completePrint(onComplete)

    it 'should print 3 copies with pauses if qty is 3', (done) ->
      iterate = (data) ->
        if printer.jobs[0].qtyPrinted != 3
          printer.print()
          return completePrint(iterate)
        data[jobKey()].status.should.equal 'done'
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
      addJob(done)

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
    it 'should set a non-nested property on the printer'

    it 'should set a nested property on the printer'

    it 'shound not set a property if it doesn\'t exist'

    it 'should not change the type of a property'

    it 'should modify an existing job and emit change', (done) ->
      printer.on 'change', (data) ->
        data[jobKey()].qty.should.equal 5
        done()
      addJob ->
        set printer.jobs[0].key, qty: 5

    it 'should move a job and reorder other jobs around it', (done) ->
      printer.on 'change', (data) ->
        data.should.not.have.property jobKey(i) for i in [0, 3]
        data.should.have.property jobKey(i)    for i in [1, 2]
        data[jobKey(2)].position.should.equal 1
        data[jobKey(1)].position.should.equal 2
        done()
      printer.addJob {} for i in [0..3]
      setImmediate -> set jobKey(1), {position: 2}

    it 'should move a job to position 0 and move all jobs down', (done) ->
      printer.on 'change', (data) ->
        expect(data['jobs[1]']?.position).to.equal 0
        expect(data['jobs[0]']?.position).to.equal 1
        done()
      addJob() for i in [0..1]
      printer.set "jobs[1]":  {position: 0}

    it 'should error if a invalid job id is given', ->
      fn = printer.set.bind(printer, "jobs[12]": {qty: 5, position: 0})
      fn.should.throw()

    it 'should error if a invalid position is given', ->
      printer.addJob()
      fn = printer.set.bind(printer, "jobs[0]": {position: 1})
      fn.should.throw()

    it 'should error if a negative qty is given', ->
      printer.addJob()
      fn = printer.set.bind(printer, "jobs[0]": {qty: -5})
      fn.should.throw()
