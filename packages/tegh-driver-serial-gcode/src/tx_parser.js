
// type heaterControl = {
//   type: 'HEATER_CONTROL',
//   id: STRING,
//   blocking: BOOLEAN,
//   targetTemperature?: FLOAT,
// }

// type fanControl = {
//   type: 'FAN_CONTROL',
//   id: STRING,
//   enabled: BOOLEAN,
//   speed?: FLOAT,
// }

// type TxParserParsedData = heaterControl | fanControl | {}

const HEATER_MCODES = ['M109', 'M104', 'M140', 'M190', 'M116']
const EXTRUDER_MCODES = ['M109', 'M104', 'M116']
const BED_MCODES = ['M140', 'M190']
const BLOCKING_MCODES = ['M109', 'M190', 'M116']

const parseHeaterID = (code, line) => {
  if (EXTRUDER_MCODES.includes(code)) {
    const extruderNumber = (/\ P([0-9]+)/.exec(line)||[])[1] || '0'
    return `e${extruderNumber}`
  } else if (BED_MCODES.includes(code)){
    return 'b'
  } else {
    throw new Error(`Invalid Temperature MCode ${code}`)
  }
}

const parseHeaterMCodes = (code, line) => {
  const parsedData = {
    type: 'HEATER_CONTROL',
    id: parseHeaterID(code, line),
    blocking: BLOCKING_MCODES.includes(code),
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

const FAN_MCODES = ['M106', 'M107']

const parseFanMCodes = (code, args) => {
  const parsedData = {
    type: 'FAN_CONTROL'
    id: args.p,
  }

  if (code === 'M106') {
    return {
      ...parsedData,
      enabled: true,
      speed: args.s * 100 / 255,
    }
  }
  if (code === 'M107') {
    return {
      ...parsedData,
      enabled: false,
      speed: 0,
    }
  }
  throw new Error(`Invalid Fan MCode ${code}`)
}

const txParser = (originalLine, {ready}) => {
  const line = originalLine.upcase()
  const [code, ...argWords] = line.split(' ')
  const args = {}
  argWords.forEach(word =>
    args[argWord[0].downcase()] = parseFloat(argWord[1..])
  )

  if (HEATER_MCODES.includes(code)) {
    return {
      parseHeaterMCodes(code, line)
    }
  }
  if (FAN_MCODES.includes(code)) {
    return parseFanMCodes(code, line)
  }

}

export default txParser
