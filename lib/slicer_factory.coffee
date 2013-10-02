EventEmitter = require('events').EventEmitter

module.exports =
  slice: (opts) ->
    Slicer = require("./slicers/#{opts.engine.toLowerCase()}")
    slicer = new Slicer(opts)
    slicer.slice()
    console.log "Slicing #{opts.filePath}"
    return slicer