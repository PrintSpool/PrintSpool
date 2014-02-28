expect = require("chai").expect
_ = require 'lodash'
tmp = require('tmp')
fs = require('fs')
Join = require('join').Join
path = require("flavored-path")

Part       = require("../lib/components/part.coffee")

tmpFiles = []

initFile = (extension, cb, content = "") ->
  tmp.file postfix: extension, (err, path, fd) ->
    tmpFiles.push fd if fd?
    throw err if err
    fs.writeFileSync path, content
    cb(path)

describe 'Part', ->

  afterEach ->
    # Close all the temp files
    fs.close(fd) for fd in tmpFiles
    _.remove tmpFiles, -> true
    # trigger gc of the part
    @part?.beforeDelete?()
    @part = null

  describe '#new', ->
    it 'should recognize a gcode file', (done) ->
      initFile ".gcode", (filePath) ->
        @part = new Part(filePath: filePath)
        expect(@part.needsSlicing()).to.equal false
        done()

    it 'should recognize a stl file', (done)->
      initFile ".stl", (filePath) ->
        @part = new Part(filePath: filePath)
        expect(@part.needsSlicing()).to.equal true
        done()

    it 'should throw an error if given a bad extension', (done)->
      initFile ".foo", (filePath) ->
        fn = -> new Part(filePath: filePath)
        expect(fn).to.throw()
        done()

  describe '#components', ->
    it 'should return a single component; the part object', (done)->
      initFile ".gcode", (filePath) ->
        @part = new Part(filePath: filePath)
        expect(@part.components().length).to.equal 1
        done()

  describe '#loadGCode', ->

    it 'should emit a load event given a .gcode file', (done)->

      slice = (slicerOpts, modelPath) ->
        sliceEnginePlaceholder =
          gcodePath: "foo.gcode"
        return sliceEnginePlaceholder

      initFile ".gcode", (filePath) =>
        @part = new Part filePath: filePath, undefined, slice
        @part.loadGCode()
        @part.on "load", -> done()

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

      join.then =>
        gcodePath = arguments[0][0]
        stlPath = arguments[1][0]
        @part = new Part filePath: stlPath, undefined, _.partial slice, gcodePath
        @part.loadGCode()
        @part.on "load", -> done()

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

      join.then =>
        gcodePath = arguments[0][0]
        stlPath = arguments[1][0]
        @part = new Part filePath: stlPath, undefined, _.partial slice, gcodePath
        @part.on "load", onLoad
        @part.loadGCode()

      onLoad = (err, gcode) =>
        expect(err).to.equal undefined, "expected on load to not error out"
        expect(gcode).to.equal "G1 X100"
        expect(@part.needsSlicing()).to.equal true, "expected needsSlicing to be true"
        expect(bindsEvents).to.equal true, "expected complete event to be bound"
        done()

    it 'should emit an error if the slicer returns a nonexistant gcode file', (done)->
      slice = (gcodePath, slicerOpts, modelPath) ->
        sliceEnginePlaceholder =
          gcodePath: "foo.gcode"
          on: (event, fn) ->
            fn() if event == 'complete'
          off: (event, fn) ->
          cancel: ->
        return sliceEnginePlaceholder

      filePath = "foo.stl"
      @part = new Part filePath: filePath, undefined, slice
      @part.loadGCode()
      @part.on "error", -> done()

    it 'should emit an error if the gcode file doesn\'t exist (no slicing)', (done)->
      filePath = "foo.gcode"
      @part = new Part filePath: filePath
      @part.loadGCode()
      @part.on "error", -> done()

