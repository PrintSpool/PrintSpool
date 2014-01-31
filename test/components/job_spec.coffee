path = require 'path'
PrintJob = require path.join __dirname, "../../lib/components/job.coffee"
chai = require("chai")
spies = require('chai-spies')
require("sugar")

chai.use(spies)
expect = chai.expect

describe 'PrintJob', ->
  describe '#new', ->
    it 'should by idle by default', ->
      job = new PrintJob filePath: "./test"
      expect(job.status).to.equal "idle"
