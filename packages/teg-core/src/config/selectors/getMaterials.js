import { createSelector } from 'reselect'

const getMaterials = createSelector(
  config => config,
  config => (
    config.materials.toMap().mapKeys((index, material) => material.id)
  ),
)

export default getMaterials
