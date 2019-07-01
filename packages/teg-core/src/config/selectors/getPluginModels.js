import { createSelector } from 'reselect'
import getPrinterConfig from './getPrinterConfig'

const getPluginModels = createSelector(
  getPrinterConfig,
  config => (
    config.plugins.toMap().mapEntries(([, p]) => [p.package, p.model])
  ),
)

export default getPluginModels
