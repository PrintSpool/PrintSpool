import { createSelector } from 'reselect'
import { heaterTypes } from '../types/PeripheralTypeEnum'

const getHeaterConfigs = createSelector(config => (
  config.machine.peripherals
    .filter(peripheral => heaterTypes.include(peripheral.type))
))

export default getHeaterConfigs
