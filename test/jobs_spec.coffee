expect = require("chai").expect
_ = require 'lodash'
tmp = require('tmp')
fs = require('fs')
Join = require('join')
path = require("flavored-path")

Job       = require("../lib/components/job.coffee")

tmpFiles = []

initFile = (extension, cb, content = "") ->
  tmp.file postfix: extension, (err, path, fd) ->
    tmpFiles.push fd if fd?
    throw err if err
    fs.writeFileSync path, content
    cb(path)

describe 'Job', ->

  afterEach ->
    # Close all the temp files
    fs.close(fd) for fd in tmpFiles
    _.remove tmpFiles, -> true
    # trigger gc of the job
    @job?.beforeDelete?()
    @job = null

  describe 'constructor', ->
    it 'should recognize a gcode file', (done) ->
      initFile ".gcode", (filePath) ->
        @job = new Job(filePath: filePath)
        expect(@job.needsSlicing()).to.equal false
        done()

    it 'should recognize a stl file', (done)->
      initFile ".stl", (filePath) ->
        @job = new Job(filePath: filePath)
        expect(@job.needsSlicing()).to.equal true
        done()

    it 'should throw an error if given a bad extension', (done)->
      initFile ".foo", (filePath) ->
        fn = -> new Job(filePath: filePath)
        expect(fn).to.throw()
        done()

  describe 'components', ->
    it 'should return a single component; the job object', (done)->
      initFile ".gcode", (filePath) ->
        @job = new Job(filePath: filePath)
        expect(@job.components().length).to.equal 1
        done()

  describe 'loadGCode', ->

    it 'should emit a load event given a .gcode file', (done)->

      slice = (slicerOpts, modelPath) ->
        sliceEnginePlaceholder =
          gcodePath: "foo.gcode"
        return sliceEnginePlaceholder

      initFile ".gcode", (filePath) =>
        @job = new Job filePath: filePath, undefined, slice
        @job.loadGCode()
        @job.on "load", -> done()

    it 'should emit a load event given a .stl file', (done)->
      join = Join.create()
      initFile ".gcode", join.add()
      initFile ".stl", join.add()

      slice = (gcodePath, slicerOpts, modelPath) ->
        sliceEnginePlaceholder =
          gcodePath: gcodePath
          on: (event, fn) ->
            fn() if event == 'complete'
          off: (event, fn) ->
          cancel: ->
        return sliceEnginePlaceholder

      join.when =>
        gcodePath = arguments[0][0]
        stlPath = arguments[1][0]
        @job = new Job filePath: stlPath, undefined, _.partial slice, gcodePath
        @job.loadGCode()
        @job.on "load", -> done()

    it 'should attempt to slice the model given a .stl file', (done)->
      bindsEvents = false
      gcodePath = path.resolve "./test/assets/simple.gcode"
      join = Join.create()
      initFile ".gcode", join.add(), "G1 X100"
      initFile ".stl", join.add()
      bindsEvents = false

      slice = (gcodePath, slicerOpts, modelPath) ->
        sliceEnginePlaceholder =
          gcodePath: gcodePath
          on: (event, fn) ->
            return unless event == 'complete'
            bindsEvents = true
            fn()
          off: (event, fn) ->
          cancel: ->
        return sliceEnginePlaceholder

      join.when =>
        gcodePath = arguments[0][0]
        stlPath = arguments[1][0]
        @job = new Job filePath: stlPath, undefined, _.partial slice, gcodePath
        @job.on "load", onLoad
        @job.loadGCode()

      onLoad = (err, gcode) =>
        expect(err).to.equal undefined, "expected on load to not error out"
        expect(gcode).to.equal "G1 X100"
        expect(@job.needsSlicing()).to.equal true, "expected needsSlicing to be true"
        expect(bindsEvents).to.equal true, "expected complete event to be bound"
        done()

    it 'should emit a job_error if the slicer returns a nonexistant gcode file', (done)->
      slice = (gcodePath, slicerOpts, modelPath) ->
        sliceEnginePlaceholder =
          gcodePath: "foo.gcode"
          on: (event, fn) ->
            fn() if event == 'complete'
          off: (event, fn) ->
          cancel: ->
        return sliceEnginePlaceholder

      filePath = "foo.stl"
      @job = new Job filePath: filePath, undefined, slice
      @job.loadGCode()
      @job.on "job_error", -> done()

    it 'should emit a job_error if the gcode file doesn\'t exist (no slicing)', (done)->
      filePath = "foo.gcode"
      @job = new Job filePath: filePath
      @job.loadGCode()
      @job.on "job_error", -> done()

