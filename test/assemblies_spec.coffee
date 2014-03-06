expect = require("chai").expect
_ = require 'lodash'
tmp = require('tmp')
fs = require('fs')
path = require ("flavored-path")

Assembly       = require("../lib/components/assembly.coffee")

tmpFiles = []

initFile = (extension, cb, content = "") ->
  tmp.file postfix: extension, (err, path, fd) ->
    tmpFiles.push fd if fd?
    throw err if err
    fs.writeFileSync path, content
    cb(path)

describe 'Assembly', ->

  afterEach ->
    # Close all the temp files
    fs.close(fd) for fd in tmpFiles
    _.remove tmpFiles, -> true
    @assembly?.beforeDelete?()
    @assembly = null

  describe 'constructor', ->

    it 'should emit an error if given a path to a nonexistant file', (done) ->
      filePath = "/definitely_not_found.zip"
      @assembly = new Assembly(filePath: filePath, fileName: "lol.zip")
      @assembly.on "error", -> done()

    it 'should emit an error if given an invalid zip file'

    it 'should not add jobs for directories'

    it 'should add a job with a valid filePath for each .gcode and .stl file'
      # filePath = path.resolve "./test/assets/Nesting_Igloos.zip"

    it 'should not add (ignore) a job for any unrecognized file extension'

  describe 'components', ->
    it 'should return an array with length jobs + 1'
