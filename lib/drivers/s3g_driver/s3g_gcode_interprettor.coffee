BufferBuilder = require '../../buffer_builder'
payloadSizes = require('./s3g_payload_sizes').payloadSizes
toolPayloadSizes = require('./s3g_payload_sizes').toolPayloadSizes
BitMask = require('bit-mask')

# Builds a payload buffer for a host query or action
# nBytes: the number of bytes to add for variable sized packets like 
#         setting EEPROM values.
payloadBuilder = (s3gCmdByte, size = payloadSizes[s3gCmdByte], nBytes = 0) ->
  size ?= 1
  b = new BufferBuilder size + nBytes
  b.addUInt8 s3gCmdByte
  return b

# Builds a payload buffer for a tool query or action
toolPayloadBuilder = (isAction, toolId, toolCmdByte, nBytes = 0) ->
  s3gCmdByte = if isAction then 136 else 10
  size = toolPayloadSizes[toolCmdByte]
  size ?= 2
  size += 1 if isAction
  b = payloadBuilder s3gCmdByte, size, nBytes
  b.addUInt8 toolId
  b.addUInt8 toolCmdByte
  b.addUInt8 size - 4 if isAction
  return b

slowestAxisStepsPerMM = (state) ->
  slowest = Math.Infinity
  slowest = v.stepsPerMM if v.stepsPerMM < slowest for k, v of state.axes
  return slowest

axesBitmask = (gcode) ->
  mask = new BitMask(0)
  for i, k of "xyzee"
    mask.setBit(i, 1) if gcode.indexOf(k) != -1
  return mask


gcodeRegex = /([a-z])([\-0-9\.]+)/g


module.exports = parse: (gcode, state) ->
  gcode = gcode.toLowerCase().replace(/\s/g, '')
  matches = gcode.match gcodeRegex

  cmd = matches.shift()
  attrs = {}
  attrs[s[0]] = parseFloat(s[1..]) for s in matches
  toolId = attrs.p || 0

  switch cmd
    when 'g0', 'g1' # Move
      b = payloadBuilder 142
      distance = 0
      for k in "xyzab"
        steps = Math.round (attrs[k]||0) * state.axes[k].stepsPerMM
        steps *= state.units_multiplier
        distance += Math.pow steps, 2
        b.addInt32 steps
      distance = Math.sqrt distance
      # Durration in microseconds
      # console.log distance
      # console.log state.feedrate
      state.feedrate = attrs.f / 60 if attrs.f?
      b.addUInt32 Math.round(100000 * distance / state.feedrate)
      # Relative axes bit mask
      b.addUInt8 if state.absolutePosition then 0x0 else 0xF

    when 'g28' # Home
      b = payloadBuilder 131
      # Timeout in seconds
      b.addUInt8 axesBitmask(gcode).value || 0xF
      # Max step rate in microseconds per step
      b.addUInt32 state.feedrate * slowestAxisStepsPerMM(state) * 1000000
      b.addUInt16 60 # 60 second timeout. This is totally arbitrary.

    when 'g4' # Dwell
      b = payloadBuilder 133
      b.addUInt32 attrs['p']

    when 'g20' # Set to inches
      state.units_multiplier = 25.4

    when 'g21' # Set to mm
      state.units_multiplier = 1

    when 'g90', 'g91' # Set to absolute / relative positioning
      state.absolutePosition = (cmd == 'g90')

    when 'g92' # Set Position (offset, does not physically move the printer)
      b = payloadBuilder 133
      b.addUInt32 attrs['p']

    when 'm17', 'm18' # Enable/Disable steppers
      b = payloadBuilder 137
      bits = 0
      bits |= 1 << i for i in [0..4]
      bits |= 1 << 7 if cmd == 'm17'
      b.addUInt8 bits

    when 'm104' # Set extruder temperature
      b = toolPayloadBuilder true, toolId, 3
      b.addInt16 attrs.s

    when 'm105' # Get extruder temperature
      b = toolPayloadBuilder false, toolId, 2

    when 'm106', 'm107' # Enable / Disable Fan
      b = toolPayloadBuilder true, toolId, 12
      b.addUInt8(if cmd == 'm106' then 1 else 0)

    when 'm109' # Set extruder temperature and wait
      # Set temp
      b = toolPayloadBuilder true, toolId, 3
      b.addInt16 attrs.s
      # Wait for tool ready
      b2 = payloadBuilder 135
      b2.addInt8 toolId
      b2.addUInt16 100 # delay between packets
      # delay until timing out and continuing even though the tool isn't ready
      # in minutes. Set to max because this sounded sketchy at best.
      b2.addUInt16 Math.pow(2,16)-1

    when 'm240', 'm241' # Enable / Disable Conveyor
      b = toolPayloadBuilder true, toolId, 13
      b.addUInt8(if cmd == 'm240' then 1 else 0)

    else
      if gcode.startsWith 't' # Select Tool
        state.tool = parseInt gcode[1..]
      else
        throw new Error "Invalid gcode #{cmd.capitalize()} in line: #{gcode}"

  return [b?.buffer, b2?.buffer].compact()
