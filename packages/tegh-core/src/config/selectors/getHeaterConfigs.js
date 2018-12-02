import { createSelector } from 'reselect'
import getComponents from './getComponents'

const getHeaterConfigs = createSelector(
  getComponents,
  components => (
    components.filter(component => component.model.get('heater') === true)
  ),
)

export default getHeaterConfigs
