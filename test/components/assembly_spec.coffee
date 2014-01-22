fs = require("fs-extra")
path = require 'path'
Assembly = require path.join __dirname, "../../lib/components/assembly.coffee"
chai = require("chai")
spies = require('chai-spies')
require("sugar")

chai.use(spies)
expect = chai.expect
zipFile = path.join __dirname, "../assets/Nesting_Igloos.zip"

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

  describe '#beforeDelete', ->
    it 'should remove the tmp directory', (done) ->
      assy.beforeDelete (err) ->
        expect(err).to.not.exist
        expect(fs.existsSync assy.tmpDir).to.be.false
        done()

