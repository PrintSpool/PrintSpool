import { createSelector } from 'reselect'

const getMaterial = createSelector(
  config => config,
  config => id => (
    config.materials.get(id)
  ),
)

export default getMaterial
