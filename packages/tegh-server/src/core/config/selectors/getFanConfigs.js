import { createSelector } from 'reselect'
import { FAN } from '../types/PeripheralTypeEnum'

const getFanConfigs = createSelector(config => (
  config.machine.peripherals
    .filter(peripheral => peripheral.type === FAN)
))

export default getFanConfigs
