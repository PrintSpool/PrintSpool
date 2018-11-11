import { List } from 'immutable'
import { createSelector } from 'reselect'

const getComponentsByType = createSelector(
  config => (
    config == null ? List() : config.components
  ),
  components => components.groupBy(c => c.type),
)

export default getComponentsByType
