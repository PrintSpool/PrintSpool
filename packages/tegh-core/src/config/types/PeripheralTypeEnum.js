import { List } from 'immutable'

export const EXTRUDER = 'EXTRUDER'
export const HEATED_BED = 'HEATED_BED'
export const HEATER = 'HEATER'
export const FAN = 'FAN'

export const heaterTypes = List([
  EXTRUDER,
  HEATED_BED,
  HEATER,
])

const PeripheralTypeEnum = List([
  EXTRUDER,
  HEATED_BED,
  HEATER,
  FAN,
])

export default PeripheralTypeEnum
