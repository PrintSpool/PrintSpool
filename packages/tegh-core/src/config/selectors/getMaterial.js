import { createSelector } from 'reselect'

const getMaterial = createSelector(config => id => (
  config.materials.get(id)
))

export default getMaterial
