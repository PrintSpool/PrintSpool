chai = require("chai")
spies = require('chai-spies')
require("sugar")
GCodeInterprettor = require "../lib/drivers/s3g_driver/s3g_gcode_interprettor.coffee"

chai.use(spies)
chai.should()
expect = chai.expect

state = null
defaultState = () ->
  axes:
    x: { stepsPerMM: 5 }
    y: { stepsPerMM: 5 }
    z: { stepsPerMM: 5 }
    a: { stepsPerMM: 5 }
    b: { stepsPerMM: 5 }
  feedrate: 300
  absolutePosition: false
  units_multiplier: 1
  tool: 1

parse = (gcode, _state) ->
  state ?= _state || defaultState()
  GCodeInterprettor.parse(gcode.toLowerCase(), state)

describe 'S3GGCodeInerprettor', ->

  afterEach ->
    state = null

  # Absolute / Relative

  it 'should parse G90 (absolute positioning)', ->
    payloads = parse "G90"
    expect(payloads).have.length 0
    expect(state.absolutePosition).to.equal true

  it 'should parse G91 (relative positioning)', ->
    payloads = parse "G91"
    expect(payloads).have.length 0
    expect(state.absolutePosition).to.equal false

  # Imperial / Metric
  it 'should parse G20 (Imperial)', ->
    state = defaultState()
    state.units_multiplier = 0
    payloads = parse "G20", state
    expect(payloads).have.length 0
    expect(state.units_multiplier).to.equal 25.4

  it 'should parse G21 (Metric)', ->
    payloads = parse "G21"
    expect(payloads).have.length 0
    expect(state.units_multiplier).to.equal 1


  # Move
  describe 'move', ->
    b = null
    distance = null
    beforeEach ->
      b = new Buffer(2+6*4)
      distance = Math.sqrt (20*20+10*10)*25
      setFeedrate()
      b.writeUInt8  142, 0
      b.writeInt32LE 10*5,  1 # X
      b.writeInt32LE 20*5,  5 # Y
      b.writeInt32LE  0,    9 # Z
      b.writeInt32LE  0,   13 # A
      b.writeInt32LE  0,   17 # B
      b.writeUInt8   0xF,  25 # Relative Bit Mask

    setFeedrate = (feedrate = 300) ->
      b.writeInt32LE  Math.round( 100000 * distance / feedrate ), 21 # Time

    it 'should parse G0', ->
      payloads = parse "G0 X10 Y 20"
      expect(payloads[0]).to.deep.equal b

    it 'should parse G1', ->
      payloads = parse "G1 X10 Y 20"
      expect(payloads[0]).to.deep.equal b

    it 'should parse G1 w/ a feedrate', ->
      payloads = parse "G1 X10 Y 20 F3000"
      setFeedrate(3000/60)
      expect(payloads[0]).to.deep.equal b

    it 'should parse absolute G1', ->
      parse "G90"
      payloads = parse "G1 X10 Y 20"
      b.writeUInt8   0x0, 25 # Relative Bit Mask
      expect(payloads[0]).to.deep.equal b

    it 'should parse relative G1', ->
      parse "G91"
      payloads = parse "G1 X10 Y 20"
      b.writeUInt8   0xF, 25 # Relative Bit Mask
      expect(payloads[0]).to.deep.equal b

    it 'should parse imperial G1', ->
      parse "G20"
      payloads = parse "G1 X10 Y 20"
      b.writeInt32LE 10*5*25.4,  1 # X
      b.writeInt32LE 20*5*25.4,  5 # Y
      distance *= 25.4
      setFeedrate()
      expect(payloads[0]).to.deep.equal b


  # Home
  it 'should parse G28 (Home)', ->
    payloads = parse "G28"
    b = new Buffer(8)
    b.writeUInt8  131, 0
    b.writeUInt8  0xF, 1
    # Max step rate in microseconds per step
    b.writeUInt32LE  state.feedrate * state.axes.x.stepsPerMM * 1000 * 1000, 2
    # Timeout in seconds
    b.writeUInt16LE 60, 6
    expect(payloads[0]).to.deep.equal b

  it 'should parse G28 w/ axes specified (Home)', ->
    payloads = parse "G28 X Y"
    b = new Buffer(8)
    b.writeUInt8  131, 0
    b.writeUInt8  0x3, 1
    # Max step rate in microseconds per step
    b.writeUInt32LE  state.feedrate * state.axes.x.stepsPerMM * 1000 * 1000, 2
    # Timeout in seconds
    b.writeUInt16LE 60, 6
    expect(payloads[0]).to.deep.equal b


  # # Set Temperature
  m104Buffer = ->
    b = new Buffer(4 + 2)
    b.writeUInt8    136, 0
    b.writeUInt8      0, 1 # Tool ID
    b.writeUInt8      3, 2 # Tool Command
    b.writeUInt8      2, 3 # Tool Command Payload Length
    b.writeUInt16LE 220, 4 # Temperature
    return b

  waitForToolBuffer = (toolID) ->
    b2 = new Buffer(2 + 2*2)
    b2.writeUInt8    135, 0
    b2.writeUInt8    toolID, 1 # Tool ID
    b2.writeUInt16LE 100, 2 # Delay between packets
    b2.writeUInt16LE Math.pow(2,16)-1, 4 # Timeout
    return b2


  it 'should parse M104', ->
    payloads = parse "M104 S220"
    b = m104Buffer()
    expect(payloads[0]).to.deep.equal b

  it 'should parse M104 for extruder #1', ->
    payloads = parse "M104 S220 P1"
    b = m104Buffer()
    b.writeUInt8      1, 1 # Tool ID
    expect(payloads[0]).to.deep.equal b

  it 'should parse M109', ->
    payloads = parse "M109 S220"
    b = m104Buffer()
    expect(payloads[0]).to.deep.equal b
    expect(payloads[1]).to.deep.equal waitForToolBuffer(0)

  it 'should parse M109 for extruder #1', ->
    payloads = parse "M109 S220 P1"
    b = m104Buffer()
    b.writeUInt8      1, 1 # Tool ID
    expect(payloads[0]).to.deep.equal b
    expect(payloads[1]).to.deep.equal waitForToolBuffer(1)


  # Get Temperature
  it 'should parse M105', ->
    payloads = parse "M105"
    b = new Buffer(3)
    b.writeUInt8     10, 0
    b.writeUInt8      0, 1 # Tool ID
    b.writeUInt8      2, 2 # Tool Command
    expect(payloads[0]).to.deep.equal b


  # Enable/Disable Conveyor
  describe 'conveyor', ->
    b = null
    beforeEach ->
      b = new Buffer(5)
      b.writeUInt8    136, 0
      b.writeUInt8      0, 1 # Tool ID
      b.writeUInt8     13, 2 # Tool Command
      b.writeUInt8      1, 3 # Tool Command Payload Length

    it 'should parse M240 (enable conveyor)', ->
      payloads = parse "M240"
      b.writeUInt8      1, 4
      expect(payloads[0]).to.deep.equal b

    it 'should parse M241 (disable conveyor)', ->
      payloads = parse "M241"
      b.writeUInt8      0, 4
      expect(payloads[0]).to.deep.equal b



  # Enable/Disable Fan
  describe 'fan', ->
    b = null
    beforeEach ->
      b = new Buffer(5)
      b.writeUInt8    136, 0
      b.writeUInt8      0, 1 # Tool ID
      b.writeUInt8     12, 2 # Tool Command
      b.writeUInt8      1, 3 # Tool Command Payload Length

    it 'should parse M106 (enable fan)', ->
      payloads = parse "M106 S255"
      b.writeUInt8      1, 4
      expect(payloads[0]).to.deep.equal b

    it 'should parse M107 (disable fan)', ->
      payloads = parse "M107"
      b.writeUInt8      0, 4
      expect(payloads[0]).to.deep.equal b

    it 'should parse M106 for extruder #2 (enable fan #2)', ->
      payloads = parse "M106 S255 P2"
      b.writeUInt8      2, 1 # Tool ID
      b.writeUInt8      1, 4
      expect(payloads[0]).to.deep.equal b

  # Enable/Disable Steppers
  it 'should parse M17 (enable steppers)', ->
    payloads = parse "M17"
    b = new Buffer(2)
    b.writeUInt8  137, 0
    b.writeUInt8  1+2+4+8+16+Math.pow(2,7), 1
    expect(payloads[0]).to.deep.equal b

  it 'should parse M18 (disable steppers)', ->
    payloads = parse "M18"
    b = new Buffer(2)
    b.writeUInt8  137, 0
    b.writeUInt8  1+2+4+8+16, 1
    expect(payloads[0]).to.deep.equal b


  # Dwell
  it 'should parse G4 (dwell)', ->
    payloads = parse "G4 P200"
    b = new Buffer(5)
    b.writeUInt8    133, 0
    b.writeUInt32LE 200, 1
    expect(payloads[0]).to.deep.equal b

  it 'should parse T (tool select)', ->
    payloads = parse "T5"
    expect(state.tool).to.equal 5
