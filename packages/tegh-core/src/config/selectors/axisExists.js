import { createSelector } from 'reselect'
import getPrinterConfig from './getPrinterConfig'
import { MOVEMENT_AXIS, EXTRUDER_AXIS } from '../types/AxisTypeEnum'
import { TOOLHEAD, AXIS } from '../types/components/ComponentTypeEnum'

const axisExists = createSelector(
  getPrinterConfig,
  config => (k, { allowTypes }) => {
    const component = config.components.find(c => c.model.get('id') === k)

    if (component == null) {
      return false
    }

    if (allowTypes.includes(MOVEMENT_AXIS) && component.type === AXIS) {
      return true
    }

    if (allowTypes.includes(EXTRUDER_AXIS) && component.type === TOOLHEAD) {
      return true
    }

    return false
  },
)

export default axisExists
