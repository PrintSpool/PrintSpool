expect = require("chai").expect
_ = require 'lodash'
FormData = require 'form-data'
fs = require 'fs'
path = require "flavored-path"
App = require("../lib/app.coffee")
https = require("https")
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
      # url = "https:/localhost:2540/printers"
      opts =
        host: 'localhost'
        port: 2540
        path: '/printers'
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
        console.log("text: " + textData)
        data = JSON.parse(textData)
        console.log(data)
        done()
      req = https.request opts, onResStart
      req.end()


  # describe "POST /printers/:uuid", ->
  #   it "should add a job", (done) ->
  #     file = path.join __dirname, "/assets/Nesting_Igloos.zip"
  #     url = "https:/localhost:2540/printers/printer_dev_null"
  #     form = new FormData()
  #     form.append 'file', fs.createReadStream file
  #     form.submit url, (err, res) =>
  #       throw err if err?
  #       done()

