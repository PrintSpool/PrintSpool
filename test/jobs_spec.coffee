expect = require("chai").expect
_ = require 'lodash'
tmp = require('tmp')

Job       = require("../lib/components/job.coffee")

initFile = (extension, cb) ->
  tmp.file postfix: extension, (err, path, fd) ->
    throw err if err
    cb(path)


describe 'Job', ->

  describe 'constructor', ->
    it 'should recognize a gcode file', (done) ->
      initFile ".gcode", (filePath) ->
        job = new Job(filePath: filePath)
        expect(job.needsSlicing()).to.equal false
        done()

    it 'should recognize a stl file', (done)->
      initFile ".stl", (filePath) ->
        job = new Job(filePath: filePath)
        expect(job.needsSlicing()).to.equal true
        done()

    it 'should throw an error if given an bad extension', (done)->
      initFile ".foo", (filePath) ->
        fn = -> new Job(filePath: filePath)
        expect(fn).to.throw()
        done()

  # describe 'components', ->

  #   it 'should return a single component; the job object', ->
  #     job = new Job("test.gcode", done)


#need a second case for model path