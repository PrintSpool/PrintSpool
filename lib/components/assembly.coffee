fs = require("fs-extra")
path = require ("flavored-path")
AdmZip = require 'adm-zip'
EventEmitter = require('events').EventEmitter
Part = require(path.join __dirname, "part")
tmp = require('tmp')
nodeUUID = require('node-uuid')
_ = require 'lodash'

module.exports = class Assembly extends EventEmitter
  type: "assembly"
  name: ""

  constructor: (opts, cb, _PrintJob = PrintJob) ->
    #original (user-defined) file name
    @fileName = opts.fileName
    nonEnumerables =
      key: nodeUUID.v4().replace(/-/g, "")
      #where the zip file is stored
      filePath: opts.filePath
      _parts: []
      tmpDir: undefined
      _cb: cb
      _PrintJob: _PrintJob
    for k, v of nonEnumerables
      Object.defineProperty @, k, value: v, writable: true
    delete opts[k] for k in ['fileName', 'filePath']
    # Creating the print jobs temp directory
    tmp.dir _.partial(@_tempDirCreated, opts)

  _tempDirCreated: (opts, err, @tmpDir) =>
    return @emit "error", err if err?
    #Does the file exist? Is the file empty?
    try
      zip = new AdmZip @filePath
      zip.extractAllTo @tmpDir, true
    catch err
      return @emit "error", err

    @_addPart entry, Object.clone(opts) for entry in zip.getEntries()
    @_parts = _.sortBy @_parts, 'fileName'
    @_cb?(@)

  _addPart: (zipEntry, opts) ->
    return if zipEntry.entryName.endsWith "/"
    Object.merge opts,
      filePath: path.join @tmpDir, zipEntry.entryName
      fileName: zipEntry.entryName
      assemblyId: @key
    @_parts.push new @_Part opts

  components: ->
    [@].union @_parts

  beforeDelete: (cb) ->
    @removeAllListeners()
    # GCing the parts
    @_parts = []
    # Deleting the temp directory
    #fs.remove @tmpDir, @_deletionErr.fill undefined, cb
    fs.remove @tmpDir, _.partial(@_deletionErr, undefined, cb)

  _deletionErr: (err, cb) ->
    console.log err.trace?() || err if err?
    cb?(err)
