import { createSelector } from 'reselect'

const getPluginModels = createSelector(
  machineConfig => machineConfig,
  config => (
    config.plugins.toMap().mapEntries(([, p]) => [p.package, p.model])
  ),
)

export default getPluginModels
