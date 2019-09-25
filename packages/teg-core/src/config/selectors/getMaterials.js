import { createSelector } from 'reselect'

const getMaterials = createSelector(
  combinatorConfig => combinatorConfig,
  combinatorConfig => (
    combinatorConfig.materials.toMap().mapKeys((index, material) => material.id)
  ),
)

export default getMaterials
