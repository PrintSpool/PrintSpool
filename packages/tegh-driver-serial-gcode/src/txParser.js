// Legacy Flow Types
// TODO: determine if these should be reimplemented in some way outside of Flow
// or removed all together.
//
// type HeaterControl = {
//   macro: string,
//   collectionKey: 'heaters',
//   id: string,
//   changes: {
//     blocking: boolean,
//     targetTemperature?: number,
//   },
// }
//
// type FanControl = {
//   macro: string,
//   collectionKey: 'fans',
//   id: number,
//   changes: {
//     enabled: boolean,
//     speed?: number,
//   },
// }
//
// type Tx = HeaterControl | FanControl | { macro: string }
//
// type SimpleParserData = {
//   macro: string,
//   args: {},
// }

import {
  parseGCode,
  toGCodeLine,
} from '@tegh/core'

const MOVEMENT_GCODES = ['G0', 'G1']
const HEATER_MCODES = ['M109', 'M104', 'M140', 'M190', 'M116']
const EXTRUDER_MCODES = ['M109', 'M104', 'M116']
const BED_MCODES = ['M140', 'M190']
const BLOCKING_MCODES = ['M109', 'M190', 'M116']

const parseMovementGCodes = (macro, args) => {
  const { f: feedrate, ...axes } = args
  const meta = {
    movement: {
      axes,
      feedrate,
    },
  }
  return meta
}

const parseHeaterID = (macro, args) => {
  // extruders
  if (EXTRUDER_MCODES.includes(macro)) {
    const extruderNumber = args.p || args.t || 0
    if (typeof extruderNumber !== 'number') {
      throw new Error('\'p\' argument is not a number')
    }
    return `e${extruderNumber}`
  // bed
  } if (BED_MCODES.includes(macro)) {
    return 'b'
  }
  throw new Error(`Invalid Temperature MCode ${macro}`)
}

const parseHeaterMCodes = (
  macro,
  args,
  line,
) => {
  const heaterControl = {
    collectionKey: 'heaters',
    id: parseHeaterID(macro, args),
    changes: {
      blocking: BLOCKING_MCODES.includes(macro),
    },
  }
  if (macro === 'M109' || macro === 'M190') {
    const targetTemperature:mixed = args.r || args.s
    if (typeof (targetTemperature) !== 'number') {
      throw new Error(
        `Heater MCode target temperature is not a number on line: ${line}`,
      )
    }
    heaterControl.changes.targetTemperature = targetTemperature
  } else if (macro !== 'M116') {
    // Only M116 (the Wait MCode) does not set a target temperature
    if (typeof args.s !== 'number') {
      throw new Error(
        `Heater MCode target temperature is not a number on line: ${line}`,
      )
    }
    heaterControl.changes.targetTemperature = args.s
  }
  return heaterControl
}

const FAN_MCODES = ['M106', 'M107']

const parseFanMCodes = (
  macro,
  args,
  line,
) => {
  const id = args.p == null ? 1 : args.p
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
    throw new Error(`Invalid M106 's' argument on line: ${line}`)
  })

  const changes = (() => {
    if (macro === 'M106') {
      return {
        enabled: true,
        speed: Math.round(get8BitFanSpeed() * 1000 / 255) / 10,
      }
    } if (macro === 'M107') {
      return {
        enabled: false,
        speed: 0,
      }
    }
    throw new Error(`Invalid Fan MCode ${macro} on line: ${line}`)
  })()

  if (typeof id !== 'number') {
    throw new Error(`Invalid ${macro} 'p' argument on line: ${line}`)
  }

  return {
    collectionKey: 'fans',
    id: `f${id}`,
    changes,
  }
}

const txParser = ({ macro: anycaseMacro, args }) => {
  const macro = anycaseMacro.toUpperCase()

  if (macro.startsWith('T')) {
    return {
      activeExtruderID: macro.slice(1),
    }
  }

  const line = toGCodeLine({ macro, args })

  if (HEATER_MCODES.includes(macro)) {
    return parseHeaterMCodes(macro, args, line)
  }
  if (FAN_MCODES.includes(macro)) {
    return parseFanMCodes(macro, args, line)
  }
  if (MOVEMENT_GCODES.includes(macro)) {
    return parseMovementGCodes(macro, args, line)
  }
  return {}
}

export const throwErrorOnInvalidGCode = (gmacroLines) => {
  gmacroLines.forEach((line) => {
    txParser(parseGCode(line))
  })
}

export default txParser
