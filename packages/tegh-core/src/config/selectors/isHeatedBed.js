import { createSelector } from 'reselect'
import { HEATED_BED } from '../types/PeripheralTypeEnum'

const isHeatedBed = createSelector(
  config => config,
  config => k => (
    config.machine.peripherals.get(k).type === HEATED_BED
  ),
)

export default isHeatedBed
