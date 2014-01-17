PrintJob = require("../lib/print_job.coffee")
chai = require("chai")
spies = require('chai-spies')
require("sugar")

chai.use(spies)
expect = chai.expect

describe 'PrintJob', ->
  describe '#new', ->
    it 'should set a default qty', ->
      job = new PrintJob null, {filePath: "./test"}
      expect(job.qty).to.equal 1
