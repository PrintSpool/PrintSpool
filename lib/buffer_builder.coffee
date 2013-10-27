require 'sugar'

# Note: This class only supports Little Endian

module.exports = class BufferBuilder
  constructor: (length) ->
    @buffer = new Buffer(length)
    @index = 0

write = (fnName, increment, val) ->
  @buffer[fnName](val, @index)
  @index += increment
  return @

addAdders = (suffix, adders) ->
  proto = BufferBuilder.prototype
  proto["add#{k}"] = write.fill("write#{k}#{suffix}",  v) for k, v of adders
  return @

addAdders '', UInt8: 1, Int8: 1
addAdders 'LE', UInt16: 2, Int16: 2, UInt32: 4, Int32: 4
