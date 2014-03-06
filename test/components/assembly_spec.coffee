fs = require("fs-extra")
path = require 'path'
Assembly = require path.join __dirname, "../../lib/components/assembly.coffee"
chai = require("chai")
spies = require('chai-spies')
require("sugar")

chai.use(spies)
expect = chai.expect
zipFile = path.join __dirname, "../assets/Nesting_Igloos.zip"
emptyZipFile = path.join __dirname, "../assets/Nesting_Iglues.zip"

describe 'Assembly', ->
  assy = null

  beforeEach (done) ->
    assy = new Assembly filePath: zipFile, -> done()

  afterEach (done) ->
    assy.beforeDelete -> done()

  describe '#new', ->
    it 'should create print jobs', ->
      comps = assy.components()
      expect(comps.length).to.equal 6
      expect(comps.map 'fileName').to.include "Nesting_Igloos/3.stl"
      expect(comps.map 'type').to.include "assembly"

    it 'should extract the zip file to a temp folder', ->
      expect(fs.existsSync assy.tmpDir).to.be.true

    it 'should put the print job files in the temp folder', ->
      file = path.join assy.tmpDir, "Nesting_Igloos/1.stl"
      expect(fs.existsSync file).to.be.true

    it 'should error if extracting a nonexistant zip file', (done) ->
      @assy = new Assembly filePath: "lies.zip"
      @assy.on "error", -> done()

    it 'should error if extracting an empty zip file', (done) ->
      @assy = new Assembly filePath: emptyZipFile
      @assy.on "error", -> done()

    it 'should emit an error if given an invalid zip file'

    it 'should not add jobs for directories'

    it 'should not add (ignore) a job for any unrecognized file extension'

  describe '#components', ->
    it 'should order the parts by file name', ->
      comps = assy.components()
      expect(comps[1].fileName).to.equal "Nesting_Igloos/1.stl"

  describe '#beforeDelete', ->
    it 'should remove the tmp directory', (done) ->
      assy.beforeDelete (err) ->
        expect(err).to.not.exist
        expect(fs.existsSync assy.tmpDir).to.be.false
        done()

