// @flow
type HeaterControl = {
  code: string,
  collectionKey: 'heaters',
  id: string,
  changes: {
    blocking: boolean,
    targetTemperature?: number,
  },
}

type FanControl = {
  code: string,
  collectionKey: 'fans',
  id: number,
  changes: {
    enabled: boolean,
    speed?: number,
  },
}

type Tx = HeaterControl | FanControl | { code: string }

type SimpleParserData = {
  code: string,
  args: {},
}

const HEATER_MCODES = ['M109', 'M104', 'M140', 'M190', 'M116']
const EXTRUDER_MCODES = ['M109', 'M104', 'M116']
const BED_MCODES = ['M140', 'M190']
const BLOCKING_MCODES = ['M109', 'M190', 'M116']

const parseHeaterID = (code, args) => {
  // extruders
  if (EXTRUDER_MCODES.includes(code)) {
    const extruderNumber = args.p || 0
    if (typeof extruderNumber !== 'number') {
      throw new Error('\'p\' argument is not a number')
    }
    return `e${extruderNumber}`
  // bed
  } if (BED_MCODES.includes(code)) {
    return 'b'
  }
  throw new Error(`Invalid Temperature MCode ${code}`)
}

const parseHeaterMCodes = (
  code: string,
  args: {},
  raw: string,
): HeaterControl => {
  const heaterControl: HeaterControl = {
    code,
    collectionKey: 'heaters',
    id: parseHeaterID(code, args),
    changes: {
      blocking: BLOCKING_MCODES.includes(code),
    },
  }
  if (code === 'M109' || code === 'M190') {
    const targetTemperature:mixed = args.r || args.s
    if (typeof (targetTemperature) !== 'number') {
      throw new Error(
        `Heater MCode target temperature is not a number on line: ${raw}`,
      )
    }
    heaterControl.changes.targetTemperature = targetTemperature
  } else if (code !== 'M116') {
    // Only M116 (the Wait MCode) does not set a target temperature
    if (typeof args.s !== 'number') {
      throw new Error(
        `Heater MCode target temperature is not a number on line: ${raw}`,
      )
    }
    heaterControl.changes.targetTemperature = args.s
  }
  return heaterControl
}

const FAN_MCODES = ['M106', 'M107']

const parseFanMCodes = (
  code: string,
  args: {},
  raw: string,
): FanControl => {
  const id = args.p || 1
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
    throw new Error(`Invalid M106 's' argument on line: ${raw}`)
  })

  const changes = (() => {
    if (code === 'M106') {
      return {
        enabled: true,
        speed: Math.round(get8BitFanSpeed() * 1000 / 255) / 10,
      }
    } if (code === 'M107') {
      return {
        enabled: false,
        speed: 0,
      }
    }
    throw new Error(`Invalid Fan MCode ${code} on line: ${raw}`)
  })()

  if (typeof id !== 'number') {
    throw new Error(`Invalid ${code} 'p' argument on line: ${raw}`)
  }

  return {
    code,
    collectionKey: 'fans',
    id,
    changes,
  }
}

export const simpleParser = (line: string): SimpleParserData => {
  const [code, ...argWords] = line.trim().split(/ +/)
  const args = {}
  argWords.forEach(word => args[word[0].toLowerCase()] = parseFloat(word.slice(1)))
  return {
    code,
    args,
  }
}

const txParser = (rawSerialOutput: string): Tx => {
  const lineCount = (rawSerialOutput.match(/\n/g) || []).length

  if (lineCount > 1) {
    throw new Error(
      `attempted to send ${lineCount} `
      + 'lines at once:'
      + `\n ${lineCount < 10 ? rawSerialOutput : '[too many lines to print]'}`,
    )
  }

  const {
    code,
    args,
  } = simpleParser(rawSerialOutput)

  if (HEATER_MCODES.includes(code)) {
    return parseHeaterMCodes(code, args, rawSerialOutput)
  }
  if (FAN_MCODES.includes(code)) {
    return parseFanMCodes(code, args, rawSerialOutput)
  }
  return { code }
}

export const throwErrorOnInvalidGCode = (gcodeLines: [string]) => {
  gcodeLines.forEach((line) => {
    txParser(line)
  })
}

export default txParser
