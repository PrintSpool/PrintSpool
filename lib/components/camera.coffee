EventEmitter = require('events').EventEmitter
_ = require 'lodash'
Photo = require '../../vendor/photo'

module.exports = class Camera extends EventEmitter

  constructor: (opts, cb) ->
    for k in ["_timeout", "_photo"]
      Object.defineProperty @, k, writable: true, value: undefined
    @[k] = v for k, v of _.merge @_defaults(), opts

    @_photo = new Photo(@id)
    .on("data", @_onData)
    .on("error", @_onError)
    # Calling the callback. For async component compatibility.
    setImmediate cb if cb?

  _defaults: ->
    id: 0
    width: 1280
    height: 1024

  _onData: (jpeg) =>
    @image = jpeg.toString('base64')
    # console.log @image
    @emit "change", @

  _onError: (err) =>
    console.log "Camera Error: #{err}. Ignoring."

  components: ->
    [@]

  beforeDelete: ->
    @_photo.removeAllListeners()
    @_photo.close()
