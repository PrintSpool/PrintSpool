// @flow
type HeaterControl = {
  lineNumber: number,
  type: 'HEATER_CONTROL',
  id: string,
  changes: {
    blocking: boolean,
    targetTemperature?: number,
  },
}

type FanControl = {
  lineNumber: number,
  type: 'FAN_CONTROL',
  id: number,
  changes: {
    enabled: boolean,
    speed?: number,
  },
}

type Tx = HeaterControl | FanControl | { lineNumber: number }

const HEATER_MCODES = ['M109', 'M104', 'M140', 'M190', 'M116']
const EXTRUDER_MCODES = ['M109', 'M104', 'M116']
const BED_MCODES = ['M140', 'M190']
const BLOCKING_MCODES = ['M109', 'M190', 'M116']

const parseHeaterID = (code, args) => {
  // extruders
  if (EXTRUDER_MCODES.includes(code)) {
    const extruderNumber = args.p || 0
    if (typeof extruderNumber != 'number') {
      throw new Error('\'p\' argument is not a number')
    }
    return `e${extruderNumber}`
  // bed
  } else if (BED_MCODES.includes(code)){
    return 'b'
  } else {
    throw new Error(`Invalid Temperature MCode ${code}`)
  }
}

const parseHeaterMCodes = (
  lineNumber: number,
  code: string,
  args: {}
): HeaterControl => {
  const heaterControl: HeaterControl = {
    lineNumber,
    type: 'HEATER_CONTROL',
    id: parseHeaterID(code, args),
    changes: {
      blocking: BLOCKING_MCODES.includes(code),
    }
  }
  if (code === 'M190' && typeof(args.r) === 'number') {
    heaterControl.changes.targetTemperature = args.r
  } else if (code !== 'M116') {
    // Only M116 (the Wait MCode) does not set a target temperature
    if (typeof args.s != 'number') {
      throw new Error('Heater MCode target temperature is not a number')
    }
    heaterControl.changes.targetTemperature = args.s
  }
  return heaterControl
}

const FAN_MCODES = ['M106', 'M107']

const parseFanMCodes = (
  lineNumber: number,
  code: string,
  args: {}
): FanControl => {
  /*
   * Returns the fan speed as a 8 bit number (range: 0 to 255)
   */
  const get8BitFanSpeed = (() => {
    if (typeof args.s === 'number') {
      return args.s
    }
    if (typeof args.s === 'undefined') {
      return 255
    }
    throw new Error(`Invalid M106 's' argument`)
  })

  const changes = (() => {
    if (code === 'M106') {
      console.log(args.s, typeof args.s)
      return {
        enabled: true,
        speed: Math.round(get8BitFanSpeed() * 1000 / 255)/10,
      }
    } else if (code === 'M107') {
      return {
        enabled: false,
        speed: 0,
      }
    } else {
      throw new Error(`Invalid Fan MCode ${code}`)
    }
  })()

  if (typeof args.p !== 'number') {
    throw new Error(`Invalid ${code} 'p' argument`)
  }

  return {
    lineNumber,
    type: 'FAN_CONTROL',
    id: args.p,
    changes,
  }
}

const txParser = (rawSerialOutput: string): Tx => {
  const [line, _checksum] = rawSerialOutput.toUpperCase().split('*')
  const [lineNumberWithN, code, ...argWords] = line.split(' ')
  const lineNumber = parseInt(lineNumberWithN.slice(1), 10)
  const args = {}
  argWords.forEach(word =>
    args[word[0].toLowerCase()] = parseFloat(word.slice(1))
  )

  if (HEATER_MCODES.includes(code)) {
    return parseHeaterMCodes(lineNumber, code, args)
  }
  if (FAN_MCODES.includes(code)) {
    return parseFanMCodes(lineNumber, code, args)
  }
  return { lineNumber }
}

export default txParser
