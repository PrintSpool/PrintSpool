fs = require("fs-extra")
path = require ("flavored-path")
AdmZip = require 'adm-zip'
EventEmitter = require('events').EventEmitter
PrintJob = require(path.join __dirname, "job")
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
      _jobs: []
      tmpDir: undefined
      _cb: cb
      _PrintJob: _PrintJob
    for k, v of nonEnumerables
      Object.defineProperty @, k, value: v, writable: true
    # Creating the print jobs temp directory
    tmp.dir _.partial(@_tempDirCreated, opts)

  _tempDirCreated: (opts, err, @tmpDir) =>
    return @emit "error", err if err?
    #Does the file exist?
    try
      zip = new AdmZip @filePath
    catch err
      console.log err
      return @emit "error", err
    #Is the file empty?
    try
      zip.extractAllTo @tmpDir, true
    catch err
      console.log err
      return @emit "error", err

    @_addJob entry, Object.clone(opts) for entry in zip.getEntries()
    @_cb?(@)

  _addJob: (zipEntry, opts) ->
    return if zipEntry.entryName.endsWith "/"
    Object.merge opts,
      filePath: path.join @tmpDir, zipEntry.entryName
      fileName: zipEntry.entryName
      assemblyId: @key
    @_jobs.push new @_PrintJob opts

  components: ->
    [@].union @_jobs

  beforeDelete: (cb) ->
    @removeAllListeners()
    # GCing the jobs
    @_jobs = []
    # Deleting the temp directory
    #fs.remove @tmpDir, @_deletionErr.fill undefined, cb
    fs.remove @tmpDir, _.partial(@_deletionErr, undefined, cb)

  _deletionErr: (err, cb) ->
    console.log err.trace?() || err if err?
    cb?(err)
