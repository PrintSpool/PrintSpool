fs = require("fs-extra")
path = require ("flavored-path")
AdmZip = require 'adm-zip'
EventEmitter = require('events').EventEmitter
PrintJob = require(path.join __dirname, "job")
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
      _jobs: []
      tmpDir: undefined
      _cb: cb
    for k, v of nonEnumerables
      Object.defineProperty @, k, value: v, writable: true
    delete opts[k] for k in ['fileName', 'filePath']
    # Creating the print jobs temp directory
    tmp.dir @_tempDirCreated.fill opts

  _tempDirCreated: (opts, err, @tmpDir) =>
    return @emit "error", err if err?
    zip = new AdmZip @filePath
    zip.extractAllTo @tmpDir, true
    @_addJob entry, Object.clone(opts) for entry in zip.getEntries()
    @_cb?(@)

  _addJob: (zipEntry, opts) ->
    return if zipEntry.entryName.endsWith "/"
    opts = Object.merge opts,
      filePath: path.join @tmpDir, zipEntry.entryName
      fileName: zipEntry.entryName
      assemblyId: @key
    @_jobs.push new PrintJob opts

  components: ->
    [@].union @_jobs

  beforeDelete: (cb) ->
    @removeAllListeners()
    # GCing the jobs
    @_jobs = []
    # Deleting the temp directory
    fs.remove @tmpDir, @_deletionErr.fill undefined, cb

  _deletionErr: (err, cb) ->
    console.log err.trace?() || err if err?
    cb?(err)
