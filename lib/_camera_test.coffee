CameraRoute = require("./camera_route")
express = require "express"
https = require "https"

app = express()
server = https.createServer(opts, @app).listen(2540)

path = "/camera.mjpg"

new CameraRoute(app, path)