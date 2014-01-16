class SmartObject extends EventEmitter
  constructor: (@validator) ->
    # New changes are put into the buffer
    @buffer = {}
    # And then copied to the data
    @data = {}
    @rmMarker = {}

  $apply: (cb) =>
    cb @buffer
    @_diffAndCopy @data, @buffer

  _diffAndCopy: (target, source) ->
    diff = {}
    @_diff target, source, diff
    @_merge [target], diff


  _diff: (target, source, diff) ->
    obj ?= diff.obj

    for k of target
      # Removed Attribute
      diff[k] = @rmMarker if !(`k in source`)

    for k of source
      # Nested Object
      if typeof target[k] == "object"
        @_copyAndDiff target[k], source[k], diff[k] = {}
      # Added Attribute or Changed Attribute
      else if (source[k] != target[k])
        diff[k] = source[k]

    return diff

  # merges a change set (diff) into both the data and the buffer
  $merge: (diff) =>
    @_merge [@buffer, @data], diff

  _merge: (targets, diff) ->
    @emit "beforeMerge", diff
    for target in targets
      changes = @_mergeRecursion target, diff
    @emit "change", changes

  _mergeRecursion: (target, diff, changedAttrs = {}) ->
    for k, v of diff
      if `v == this.rmMarker`
        delete target[k]
        @emit "rm", k, target
      else if typeof v == "object"
        @_merge target[k], v, ( changedAttrs[k] = {} )
      else if target[k]?
        changedAttrs[k] = v
        target[k] = v
      else
        @emit "add", k, v, target
        target[k] = v
    return changedAttrs
