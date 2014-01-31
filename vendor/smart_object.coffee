EventEmitter = require('events').EventEmitter

module.exports = class SmartObject extends EventEmitter
  constructor: (buffer) ->
    # New changes are put into the buffer
    @buffer = buffer || {}
    # And then copied to the data
    @data = {}
    @rmMarker = {}
    # Initialization: Copy the buffer into the data
    @_diff @data, @buffer, diff = {}
    @_mergeRecursion @data, diff

  # Sets a key/value of the smart object directly without triggering any events.
  set: (key, value) =>
    @buffer[key] = value
    @_diff @data, @buffer, diff = {}
    @_mergeRecursion @data, diff

  $apply: (cb) =>
    throw "Cannot recursively $apply" if @_insideApply
    @_insideApply = true
    try
      cb @buffer
    finally
      @_insideApply = false
    # Create a diff by comparing the data and the buffer
    @_diff @data, @buffer, diff = {}
    # Merge the diff into the data
    @_merge diff, true

  _diff: (target, source, diff) ->
    for k, v of target
      continue if v instanceof Function
      # Removed Attribute
      diff[k] = @rmMarker unless source[k]?

    for k, v of source
      continue if v instanceof Function
      # Nested Object
      if typeof v == "object"
        @_diff (target[k] || {}), v, subDiff = {}
        diff[k] = subDiff if Object.keys(subDiff).length > 0
      # Added Attribute or Changed Attribute
      else if (v != target[k])
        diff[k] = v

    return diff

  # merges a change set (diff) into both the data and the buffer
  $merge: (diff, runCallbacks) =>
    @_mergeRecursion @buffer, diff
    @_merge diff, runCallbacks

  _merge: (diff, runCallbacks = true) ->
    if runCallbacks
      # Emit a before merge event in which the buffer can be further transformed
      @emit "beforeMerge", diff
      # Create an updated diff by once again comparing the data and the buffer
      @_diff @data, @buffer, diff = {}

    [changes, add, rm] = @_mergeRecursion @data, diff

    @emit "change", changes if Object.keys(changes).length > 0
    @emit.fill("add").apply @, args for args in add
    @emit.fill("rm").apply  @, args for args in rm

  _mergeRecursion: (target, diff, changedAttrs = {}, add = [], rm = []) ->
    for k, v of diff
      continue if v instanceof Function
      # Add
      if !(target[k]?) and typeof(v) == "object"
        v = @_withoutFns v
        add.push [k, v, target]
        target[k] = v
      # Rm
      else if `v == this.rmMarker`
        rm.push [k, target]
        delete target[k]
      # Recurse
      else if typeof(v) == "object"
        @_mergeRecursion target[k], v, ( attrs = {} ), add, rm
        changedAttrs[k] = attrs if Object.keys(attrs).length > 0
      # Change
      else
        changedAttrs[k] = v
        target[k] = v
    return [changedAttrs, add, rm]

  _withoutFns: (source) ->
    return source unless typeof source == "object"
    target = {}
    for k, v of source
      continue if v instanceof Function
      target[k] = @_withoutFns v
    return target
