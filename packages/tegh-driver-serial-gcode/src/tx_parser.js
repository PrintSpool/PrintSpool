// type TxParserParsedData = {
//   id?: STRING,
//   blocking?: BOOLEAN,
//   targetTemperature?: FLOAT,
// }

const HEATER_MCODES = ['M109', 'M104', 'M140', 'M190', 'M116']
const EXTRUDER_MCODES = ['M109', 'M104', 'M116']
const BED_MCODES = ['M140', 'M190']
const BLOCKING_MCODES = ['M109', 'M190', 'M116']

// TODO: fan control
// const FAN_MCODES = []

const parseHeaterID = (code, line) => {
  if (EXTRUDER_MCODES.includes(code)) {
    const extruderNumber = (/\ P([0-9]+)/.exec(line)||[])[1] || '0'
    return `e${extruderNumber}`
  } else if (BED_MCODES.includes(code)){
    return 'b'
  } else {
    throw new Error(`Invalid Temperature GCode ${gcode}`)
  }
}

const parseHeaterData = (code, line) => {
  const parsedData = {
    id: parseHeaterID(code, line)
    blocking: BLOCKING_MCODES.includes(code)
  }
  if (code === 'M116') { // M116 AKA Wait does not set a target temperature
    return parsedData
  } else {
    const targetTemperature = parseFloat((/S([0-9]+)/.exec(line)||[])[1] || '0')
    return {
      ...parsedData,
      targetTemperature,
    }
  }
}

const txParser = (originalLine, {ready}) => {
  const line = originalLine.upcase()
  const [code, ...args] = line.split(' ')

  if (HEATER_MCODES.includes(code)) {
    return {
      parseHeaterData(code, line)
    }
  }

}

export default txParser
