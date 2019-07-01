import { createSelector } from 'reselect'
import getPrinterConfig from './getPrinterConfig'

const getMaterials = createSelector(
  getPrinterConfig,
  config => (
    config.components.toMap().mapKeys((index, component) => component.id)
  ),
)

export default getMaterials
