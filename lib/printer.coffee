EventEmitter = require('events').EventEmitter
path = require 'path'
require 'sugar'
_ = require 'lodash'
PrintJob = require "./components/job"
Assembly = require "./components/assembly"
SmartObject = require "../vendor/smart_object"

module.exports = class Printer extends EventEmitter

  _nextJobId: 0
  _defaultAttrs:
    heater:
      type: 'heater'
      enabled: false
      targetTemp: 0
      currentTemp: 0
      targetTempCountdown: 0
      flowrate: 40 / 60
      blocking: false
    conveyor: { type: 'conveyor', enabled: false, speed: 255 }
    fan: { type: 'fan', enabled: false, speed: 255 }
  _baseComponents: ->
    state: { status: 'initializing' }
    motors: { enabled: true }
    axes: { xyFeedrate: 3000 / 60, zFeedrate: 300 / 60 }

  constructor: (@driver, @config, @_PrintJob=PrintJob) ->
    # Adding getters
    getters = ['status', 'jobs', 'idleJobs', 'extruders']
    Object.defineProperty @, k, get: @["_get#{k.camelize()}"] for k in getters
    # Building the printer's data
    @$ = new SmartObject @_baseComponents()
    @_onConfigChange()
    @data = @$.data
    # Binding to changes in the data
    @$.on k, @emit.bind @, k for k in ['add', 'rm', 'change']
    @$.on "beforeMerge", @_beforeMerge
    # Binding driver events
    events = ['ready', 'print_job_line_sent', 'print_complete', 'disconnect']
    @driver.on k, @["_on#{k.camelize()}"] for k in events
    @driver.on "change", @$.$merge.fill(undefined, false)
    # Binding config events
    @config.on?(k, @_onConfigChange) for k in ['change', 'add', 'rm']

  _getStatus: =>
    @$.data.state.status

  _getJobs: =>
    _(@$.buffer).where(type: "job").sortBy('position').value()

  _getExtruders: =>
    _.pick @$.buffer, (v, k) -> k.startsWith('e') and v.type == 'heater'

  _getIdleJobs: =>
    _.where @jobs, status: "idle"

  _beforeMerge: (diff) =>
    for k1, diffComp of diff
      continue unless @$.data[k1]?
      type = @$.data[k1].type || k1
      for k2, v of diffComp
        @["_before#{type}#{k2.capitalize()}Change"]?(k1, k2, v)

  # Reordering the other jobs after a job's position was changed
  _beforejobPositionChange: (k1, k2, _new) ->
    oldComp = @$.data[k1]
    _old = oldComp.position
    @jobs.filter((j) -> j.key != oldComp.key).each (j) ->
      j.position += 1 if _old > j.position >= _new
      j.position -= 1 if _old < j.position <= _new

  _onReady: =>
    @$.$merge state: {status: 'idle'}, false

  _onDisconnect: =>
    @$.removeAllListeners()
    @removeAllListeners()
    job.cancel().removeAllListeners() for job in @jobs

  _onConfigChange: => @$.$apply (data) =>
    whitelist = _(@_baseComponents()).merge(@config.components)
    # Removing deleted components
    console.log "deleting #{k}" for k, v of data when !(whitelist.has k)
    delete data[k] for k of data when !(whitelist.has k)
    # Adding new components
    data[k] ?= _.clone @_defaultAttrs[v] for k, v of @config.components
    # Updating print qualities
    data.printQualities = _.cloneDeep @config.printQualities
    # Adding the extruders to the axes
    @_axes = ['x','y','z'].concat _.keys @extruders

  addJob: (attrs = {}) =>
    # Determining if the job is a multipart assembly or a single part
    isZip = path.extname(attrs.filePath) == ".zip"
    JobPrototype = if isZip then Assembly else @_PrintJob
    # Configuring and initializing the component
    job = new JobPrototype attrs, @_onJobInit

  _onJobInit: (job) => @$.$apply (data) =>
    i = @jobs.length
    # Adding the job or job_part component and its subcomponents
    for jobComp in job.components
      # Adding a job subcomponent (either a job or a job_part)
      data[jobComp.key] = jobComp
      # Setting the position of each job_part subcomponent
      jobComp.position = i++ if jobComp.type == 'job'

  rm: (key) => @$.$apply (data) =>
    comp = data[key]
    throw "job/assembly does not exist" if ['job', 'assembly'].none comp?.type
    for subcomponent in comp.components
      subcomponent.beforeDelete()
      delete data[subcomponent.key] if data[subcomponent.key]?

  estop: => @$.$apply (data) =>
    @driver.reset()
    job = @currentJob || {}
    job.cancel?()
    job.status = data.state.status =  'estopped'
    @_resetComponent comp for k, comp of @$.data

  _resetComponent: (comp) -> switch comp.type
    when "heater"
      comp.targetTemp = 0
      comp.enabled = false
    when "conveyor", "fan"
      comp.enabled = false

  # set any number of the following printer attributes:
  # - extruder/bed target_temp
  # - fan enabled
  # - fan speed
  # - conveyor enabled
  set: (diff) ->
    # Fail fast: verify the diff is a key/value store
    throw 'set data must be an object' unless Object.isObject(diff)
    # Fail fast: attribute whitelisting and validation
    for k1, diffComp of diff
      throw "#{k1} is not a component" unless @$.buffer.hasOwnProperty k1
      @_beforeAttrSet @$.buffer[k1], k1, k2, v for k2, v of diffComp
    # Fail fast: Settings that can not be set while the printer is busy
    if ['printing', 'estopped'].any @status
      comps = Object.keys(diff).map (k) => @$.buffer[k]
      comp = comps.find type: /heater|conveyor|fan/
      throw "cannot set #{comp.type} while printing." if comp?
    # Applying the diff
    @$.$merge diff
    # Send gcodes to the print driver to update the printer
    gcodes = Object.map diff, (k, v) => @_compGCode k, @$.buffer[k], v
    @driver.sendNow gcode for gcode in Object.values(gcodes).compact()

  _greaterThenZero:
    job: ['qty', 'position']
    axes: ['xyFeedrate', 'zFeedrate']

  # Whitelisting and validation of set parameters
  _beforeAttrSet: (comp, k1, k2, v) ->
    throw "#{k1}.#{k2} is not an attribute" unless comp.hasOwnProperty k2
    type = (comp.type || k1)
    allowed = switch type
      when "heater"   then ['enabled', 'targetTemp']
      when "fan"      then ['enabled', 'speed']
      when "axes"     then ['xyFeedrate', 'zFeedrate']
      when "conveyor", "motors" then ['enabled']
      when "job" then ['qty', 'position', 'quality']
      else []
    attrType = typeof(comp[k2])

    throw "#{k1}.#{k2} is not a settable attribute." unless (`k2 in allowed`)
    throw "#{k1}.#{k2} must be a #{attrType}." if typeof(v) != attrType
    if @_greaterThenZero[type]?.any?(k2) and v < 0
      throw "#{k1}.#{k2} must be greater then zero."
    @_beforeJobAttrSet comp, k1, k2, v if comp.type == 'job'

  _beforeJobAttrSet: (comp, k1, k2, v) ->
    if k2 == 'position' and v >= @jobs.length
      throw "Invalid position."
    if k2 == 'quality' and !(@config.printQualities.options.hasOwnProperty k2)
      throw "Invalid print quality"
    if k2 == 'quality' and comp.needsSlicing() == false
      throw "Cannot set slicing quality for gcode files"

  _heaterGCode: (key) -> switch key
    when 'b' then "M140"
    when 'e0' then "M104"
    else "M104 P#{k[1..]}"

  _compGCode: (key, comp, diff) -> switch comp.type || key
    when "conveyor"
      if comp.enabled then "M240" else "M241"
    when "fan"
      if comp.enabled then "M106 S#{comp.speed}" else "M107"
    when "motors"
      "M1#{if comp.enabled then 7 else 8}"
    when "heater"
      targetTemp = if comp.enabled then comp.targetTemp else 0
      "#{@_heaterGCode key} S#{targetTemp}"
    else undefined

  retryPrint: => @$.$apply (data) =>
    @_print "estopped", "No estopped print jobs"

  print: => @$.$apply (data) =>
    @_printNextIdleJob()

  _printNextIdleJob: (continuation) ->
    msg = "No idle print jobs. To reprint an estopped job use retry_print."
    @_print "idle", msg, continuation

  _print: (status, notFoundMessage, continuation = false) =>
    # Fail fast
    if !continuation and ['printing', 'slicing'].any @status
      throw "Already printing."
    if ['estopped', 'initializing'].any @status
      throw "Can not print when #{@status}."
    @currentJob = @jobs.find status: status
    throw notFoundMessage unless @currentJob?

    # Moving the job to the top of the queue if it isn't already there
    @currentJob.position = 0
    # Deleting any estopped jobs
    (@rm j.key if j?.status == "estopped" and j != @currentJob) for j in @jobs
    # Setting status to slicing (if necessary)
    if @currentJob.needsSlicing?
      @currentJob.status = @$.buffer.state.status = "slicing"
    # Loading the gcode
    slicerOpts = @config.printQualities.options[@currentJob.quality]
    @currentJob.loadGCode slicerOpts, @_onReadyToPrint.fill(@currentJob)

  _onReadyToPrint: (job, err, gcode) => @$.$apply (data) =>
    @driver.print gcode
    job.status = data.state.status = 'printing'
    job.startTime = new Date().getTime()

  _onPrintJobLineSent: => @$.$apply (data) =>
    @currentJob.currentLine++

  _onPrintComplete: =>
    job = @currentJob
    totalQty = job.qty * (@$.buffer[job.assemblyId]?.qty || 1)
    done = job.qtyPrinted + 1 >= totalQty
    pause = @config.pauseBetweenPrints
    pause ||= @idleJobs.exclude(job).length == 0
    @currentJob = null if done
    # Updating the job and printer and starting the next print or pausing
    jobAttrs =
      qtyPrinted: job.qtyPrinted + 1
      elapsedTime: new Date().getTime() - job.startTime
      status: if done then 'done' else if pause then 'idle' else 'printing'
    @$.$apply (data) =>
      Object.merge job, jobAttrs
      data.state.status = 'idle' if pause
      @_printNextIdleJob true if !pause
      # Removing the job if it's complete (it's status having already been set
      # to "done")
      setImmediate => @rm job.key if done

  move: (axesVals) ->
    # Fail fast
    @_assert_idle 'move'
    err = "move must be called with a object of axes/distance key/values."
    # console.log axesVals
    throw err unless typeof(axesVals) == 'object' and axesVals?
    axesVals = Object.extended(axesVals)
    multiplier = axesVals.at || 1
    delete axesVals.at
    axes = Object.keys(axesVals).exclude((k) => @_axes.some(k))
    console.log @_axes
    @_asert_no_bad_axes 'move', axes
    # Adding the axes values
    # gcode = axesVals.reduce ((s, k, v) -> "#{s} #{k.toUpperCase()}#{v}"), 'G1'
    gcode = 'G1'
    gcode += " #{k.replace(/e\d/, 'e').toUpperCase()}#{v}" for k, v of axesVals
    # Calculating and adding the feedrate
    feedrate = @$.data.axes["#{if axesVals.z? then 'z' else 'xy'}Feedrate"]
    extruders = axesVals.keys().filter (k) -> k.startsWith 'e'
    eFeedrates = extruders.map (k) => @$.data[k].flowrate
    feedrate = eFeedrates.reduce ( (f1, f2) -> Math.min f1, f2 ), feedrate
    feedrate *= 60 * multiplier
    gcode = "G91\nG1 F#{feedrate}\n#{gcode} F#{feedrate}"
    if extruders.length > 0
      gcode = "T#{extruders[0].replace 'e', ''}\n#{gcode}"
    # Sending the gcode
    @driver.sendNow gcode

  home: (axes = ['x', 'y', 'z']) ->
    # Fail fast
    @_assert_idle 'home'
    throw "home must be called with an array of axes." unless Array.isArray axes
    @_asert_no_bad_axes 'home', axes.exclude((k,v) => @_axes.indexOf(k) > -1)
    # Implementation
    @driver.sendNow "G28 #{axes.join(' ').toUpperCase()}"

  _assert_idle: (method_name) =>
    return if @status == 'idle'
    throw "Cannot #{method_name} when #{@status}."

  _asert_no_bad_axes: (methodName, badAxes) ->
    return if badAxes.length == 0
    s = badAxes.join ','
    throw "#{methodName} must be called with valid axes. #{s} are invalid."
