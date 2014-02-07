_ = require "lodash"
camera = require('camera')
png = require "pngjs"
Jpeg = require "jpeg"

module.exports = class CameraRoute
  constructor: (app, path) ->
    # app.get path, @_get
    @_responses = []
    @webcam = camera.createStream()
    @webcam.on "data", @_onCameraFrame
    @webcam.on "error", @_onCameraErr

  _onCameraFrame: (buffer) =>
    cb = @_onFrameDecode
    png.parse buffer, (err, buffer) -> cb(@, err, buffer)
    console.log "frame received!"

  _onFrameDecode: (image, err, buffer) =>
    return @_onCameraErr err if err?
    console.log "decoded!"
    jpeg = new Jpeg(buffer, image.width, image.height).encode @_onFrameReencode

  _onFrameReencode: (image, err) =>
    return @_onCameraErr err if err?
    console.log image
    console.log "re-encoded!"

  _onCameraErr: (err) =>
    console.log err

  _get: (request, res) =>
    new CameraConnection(res, @camelot)
    res.connection.on "close", _.fill @_onResClose, res
    @_responses.push res
    return

  _onResClose: (resA) =>
    _.remove @_responses, (resB) => resA == resB

  kill: =>
    res.end() for res in @_responses

class CameraConnection
  constructor: (@res, @camelot) ->
    @res.writeHead 200, @_header
    @res.connection.on "close", @_onClose
    @_send_next()

  _header:
    "Content-Type": "multipart/x-mixed-replace; boundary=myboundary"
    "Cache-Control": "no-cache"
    Connection: "close"
    Pragma: "no-cache"

  _onClose: =>
    clearTimeout @_timeout if @_timeout?

  sendJpeg: (err, content) ->
    return @res.end() if err?
    @res.write "--myboundary\r\n"
    @res.write "Content-Type: image/jpeg\r\n"
    @res.write "Content-Length: " + content.length + "\r\n"
    @res.write "\r\n"
    @res.write content, "binary"
    @res.write "\r\n"
    @_timeouts = setTimeout @_send_next, 500
