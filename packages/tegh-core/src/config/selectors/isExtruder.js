import { createSelector } from 'reselect'
import { EXTRUDER } from '../types/ComponentTypeEnum'

const isExtruder = createSelector(
  config => config,
  config => k => (
    config.machine.components.get(k, {}).type === EXTRUDER
  ),
)

export default isExtruder
