import { createSelector } from 'reselect'
import { heaterTypes } from '../types/ComponentTypeEnum'

const getHeaterConfigs = createSelector(
  config => config.getIn(['machine', 'components']),
  components => (
    components.filter(component => heaterTypes.includes(component.type))
  ),
)

export default getHeaterConfigs
