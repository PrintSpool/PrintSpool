fs = require("fs-extra")
path = require ("flavored-path")
AdmZip = require 'adm-zip'
EventEmitter = require('events').EventEmitter
Part = require(path.join __dirname, "part")
tmp = require('tmp')
nodeUUID = require('node-uuid')

module.exports = class Assembly extends EventEmitter
  type: "assembly"
  name: ""

  constructor: (opts, cb) ->
    @fileName = opts.fileName
    nonEnumerables =
      key: nodeUUID.v4().replace(/-/g, "")
      filePath: opts.filePath
      _parts: []
      tmpDir: undefined
      _cb: cb
    for k, v of nonEnumerables
      Object.defineProperty @, k, value: v, writable: true
    delete opts[k] for k in ['fileName', 'filePath']
    # Creating the part files temp directory
    tmp.dir @_tempDirCreated.fill opts

  _tempDirCreated: (opts, err, @tmpDir) =>
    return @emit "error", err if err?
    zip = new AdmZip @filePath
    zip.extractAllTo @tmpDir, true
    @_addPart entry, Object.clone(opts) for entry in zip.getEntries()
    @_cb?(@)

  _addPart: (zipEntry, opts) ->
    return if zipEntry.entryName.endsWith "/"
    opts = Object.merge opts,
      filePath: path.join @tmpDir, zipEntry.entryName
      fileName: zipEntry.entryName
      assemblyId: @key
    @_parts.push new Part opts

  components: ->
    [@].union @_parts

  beforeDelete: (cb) ->
    @removeAllListeners()
    # GCing the parts
    @_parts = []
    # Deleting the temp directory
    fs.remove @tmpDir, @_deletionErr.fill undefined, cb

  _deletionErr: (err, cb) ->
    console.log err.trace?() || err if err?
    cb?(err)
