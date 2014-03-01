expect = require("chai").expect
_ = require 'lodash'
Join = require('join').Join
FormData = require 'form-data'
fs = require 'fs'
path = require "flavored-path"
App = require("../lib/app.coffee")
https = require("https")
app = null
printer = null

upload = (fileName, cb) ->
  file = path.join __dirname, "assets", fileName
  opts =
    protocol: "https:"
    host: 'localhost'
    port: 2540
    path: '/printers/printer_dev_null'
    rejectUnauthorized: false
  join = Join.create()
  # The printer will emit an add event asynchronously so we need to
  # wait for that to test the added components.
  printer.on "add", join.add()
  # Posting the form
  form = new FormData()
  form.append 'file', fs.createReadStream file
  form.submit opts, join.add()
  # Waiting for the https response and printer add event
  join.then ->
    [err, res] = arguments[1]
    expect(err).to.equal null
    expect(res.statusCode).to.equal 200
    cb err, res

describe "API", ->
  beforeEach (done) ->
    opts = {silent: true}
    opts["dry-run"] = true
    app = new App(opts, done)
    printer = app.printerServers['dev/null'].printer

  afterEach ->
    app.kill()

  describe "GET /printers.json", ->
    it "should get a list of printers", (done) ->
      # url = "https:/localhost:2540/printers"
      opts =
        host: 'localhost'
        port: 2540
        path: '/printers.json'
        method: 'GET'
        rejectUnauthorized: false
      res = undefined
      textData = ""
      onResStart = (res) ->
        res
        .on("data", onResData)
        .on("end", onResEnd)
        # expect(res.statusCode).to.equal 200
      onResData = (chunk) ->
        textData += chunk
      onResEnd = ->
        data = JSON.parse(textData)
        expect(data.printers["dev/null"]).to.equal "printer_dev_null"
        done()
      req = https.request opts, onResStart
      req.end()


  describe "POST /printers/:uuid", ->
    it "should add an assembly", (done) ->
      upload "Nesting_Igloos.zip", (err, res) ->
        expect(printer.parts[0]?.fileName).to.equal "Nesting_Igloos/1.stl"
        done()

    it "should add a part", (done) ->
      upload "move_x.gcode", (err, res) ->
        expect(printer.parts[0]?.fileName).to.equal "move_x.gcode"
        done()

