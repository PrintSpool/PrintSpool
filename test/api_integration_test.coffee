expect = require("chai").expect
_ = require 'lodash'
FormData = require 'form-data'
fs = require 'fs'
path = require "flavored-path"
App = require("../lib/app.coffee")
app = null

describe "API", ->
  beforeEach (done) ->
    opts = {}
    opts["dry-run"] = true
    app = new App(opts, done)

  afterEach ->
    app.kill()

  describe "GET /printers.json", ->
    it "should get a list of printers", (done) ->

  describe "POST /printers/:uuid/jobs/", ->
    it "should add a job", (done) ->
      file = path.join __dirname, "/assets/Nesting_Igloos.zip"
      url = "https:/127.0.0.1:2540/printers/printer_dev_null/jobs"
      form = new FormData()
      form.append 'job', fs.createReadStream file
      form.submit url, (err, res) =>
        throw err if err?
        done()

