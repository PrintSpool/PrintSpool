import { createSelector } from 'reselect'
import { HEATED_BED } from '../types/ComponentTypeEnum'

const isHeatedBed = createSelector(
  config => config,
  config => k => (
    config.machine.components.get(k).type === HEATED_BED
  ),
)

export default isHeatedBed
