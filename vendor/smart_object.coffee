EventEmitter = require('events').EventEmitter

module.exports = class SmartObject extends EventEmitter
  constructor: (data) ->
    # New changes are put into the buffer
    @buffer = data
    # And then copied to the data
    @data = {}
    @_diffAndCopy @data, @buffer
    @rmMarker = {}

  $apply: (cb) =>
    throw "Cannot recursively $apply" if @_insideApply
    @_insideApply = true
    cb @buffer
    @_insideApply = false
    @_diffAndCopy @data, @buffer

  _diffAndCopy: (target, source) ->
    diff = {}
    @_diff target, source, diff
    @_merge [target], diff


  _diff: (target, source, diff) ->
    for k, v of target
      continue if v instanceof Function
      # Removed Attribute
      diff[k] = @rmMarker unless source[k]?

    for k, v of source
      continue if v instanceof Function
      # Nested Object
      if typeof v == "object"
        @_diff (target[k] || {}), v, diff[k] = {}
      # Added Attribute or Changed Attribute
      else if (v != target[k])
        diff[k] = v

    return diff

  # merges a change set (diff) into both the data and the buffer
  $merge: (diff) =>
    @_merge [@buffer, @data], diff

  _merge: (targets, diff) ->
    @emit "beforeMerge", diff
    for target in targets
      [changes, add, rm] = @_mergeRecursion target, diff
    @emit "change", changes
    @emit.fill("add").apply @, args for args in add
    @emit.fill("rm").apply  @, args for args in rm

  _mergeRecursion: (target, diff, changedAttrs = {}, add = [], rm = []) ->
    for k, v of diff
      continue if v instanceof Function
      # Add
      if !(target[k]?)
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
