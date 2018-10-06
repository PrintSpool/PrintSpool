import { createSelector } from 'reselect'
import { heaterTypes } from '../types/PeripheralTypeEnum'

const getHeaterConfigs = createSelector(
  config => config.getIn(['machine', 'peripherals']),
  peripherals => (
    peripherals.filter(peripheral => heaterTypes.includes(peripheral.type))
  ),
)

export default getHeaterConfigs
