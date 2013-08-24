Printer = require("../lib/printer.coffee")
chai = require("chai")
spies = require('chai-spies')
EventEmitter = require('events').EventEmitter
require("sugar")

chai.use(spies)
chai.should()

class DriverStub extends EventEmitter
  constructor: ->
    # TODO: Stub all the things!

class PrintJobStub extends EventEmitter
  constructor: (attrs) ->
    @[k] = v for k, v of attrs

describe 'Printer', ->
  driver = null
  printer = null

  beforeEach ->
    driver  = new DriverStub()
    printer = new Printer driver, {}, {}, PrintJobStub

  describe 'addJob', ->

    it 'should store the job in the queue', ->
      printer.addJob {}
      printer.getJobs().length.should.equal 1

    it 'should start job ids at 0', ->
      printer.addJob {}
      printer.getJobs()[0].id.should.equal 0

    it 'should ignore pased id attributes', ->
      printer.addJob id: 5
      printer.getJobs()[0].id.should.equal 0

    it 'should set the qty', ->
      printer.addJob qty: 5
      printer.getJobs()[0].qty.should.equal 5

    it 'should emit add', (done) ->
      printer.on 'add', (key, job) ->
        key.should.equal "jobs[0]"
        job.id.should.equal 0
        done()
      printer.addJob {}

    it 'should place the job at the end of the queue by default', ->
      printer.addJob {}
      printer.getJobs()[0].position.should.equal 0

    it 'should set a default qty', ->
      printer.addJob {}
      printer.getJobs()[0].qty.should.equal 1

  describe 'rmJob', ->
    it 'should remove and existing job without error and emit remove', (done) ->
      printer.on 'remove', (key) ->
        key.should.equal "jobs[0]"
        done()
      printer.addJob {}
      printer.rmJob id: 0

    it 'should error if the job does not exist', ->
      printer.addJob
      printer.rmJob.bind(printer, id: 5).should.throw()

  describe 'changeJob', ->
    it 'should modify an existing job and emit change',(done) ->
      printer.on 'change', (data) ->
        data['jobs[0]'].should.not.have.property 'id'
        data['jobs[0]'].qty.should.equal 5
        done()
      printer.addJob {}
      printer.changeJob id: 0, qty: 5

    it 'should move a job and reorder other jobs around it',(done) ->
      printer.on 'change', (data) ->
        data.should.not.have.property "jobs[#{i}]" for i in [0, 3]
        data.should.have.property "jobs[#{i}]"     for i in [1, 2]
        data['jobs[2]'].position.should.equal 1
        data['jobs[1]'].position.should.equal 2
        done()
      printer.addJob {} for i in [0..3]
      printer.changeJob id: 2, position: 1

    it 'should error if a invalid job id is given', ->
      fn = printer.changeJob.bind(printer, id: 12, qty: 5, position: 0)
      fn.should.throw()

    it 'should error if a invalid position is given', ->
      printer.addJob
      fn = printer.changeJob.bind(printer, id: 0, position: 1)
      fn.should.throw()

    it 'should error if a negative qty is given', ->
      printer.addJob
      fn = printer.changeJob.bind(printer, id: 0, qty: -5)
      fn.should.throw()

  describe 'estop', ->

  describe 'set', ->

  describe 'print', ->

  describe 'move', ->

  describe 'home', ->

