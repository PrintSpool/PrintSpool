import { createSelector } from 'reselect'
import { heaterTypes } from '../types/PeripheralTypeEnum'

const getMaterial = createSelector(config => id => (
  config.materials.get(id)
))

export default getMaterial
