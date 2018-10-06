import { createSelector } from 'reselect'
import { FAN } from '../types/PeripheralTypeEnum'

const getFanConfigs = createSelector(
  config => config.getIn(['machine', 'peripherals']),
  peripherals => peripherals.filter(peripheral => peripheral.type === FAN),
)

export default getFanConfigs
