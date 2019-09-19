import { createSelector } from 'reselect'
import getComponents from './getComponents'

const getComponentsByType = createSelector(
  getComponents,
  components => components.groupBy(c => c.type),
)

export default getComponentsByType
