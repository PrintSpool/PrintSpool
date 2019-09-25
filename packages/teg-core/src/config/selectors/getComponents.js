import { createSelector } from 'reselect'

const getMaterials = createSelector(
  machineConfig => machineConfig,
  config => (
    config.components.toMap().mapKeys((index, component) => component.id)
  ),
)

export default getMaterials
