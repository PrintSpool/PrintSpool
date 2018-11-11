import { createSelector } from 'reselect'
import { FAN } from '../types/ComponentTypeEnum'

const getFanConfigs = createSelector(
  config => config.getIn(['machine', 'components']),
  components => components.filter(component => component.type === FAN),
)

export default getFanConfigs
