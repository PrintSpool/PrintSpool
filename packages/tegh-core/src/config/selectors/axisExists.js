import { createSelector } from 'reselect'
import { MOVEMENT_AXIS, EXTRUDER_AXIS } from '../types/AxisTypeEnum'
import { EXTRUDER } from '../types/ComponentTypeEnum'

const axisExists = createSelector(
  config => config,
  config => (k, { allowTypes }) => {
    if (allowTypes.includes(MOVEMENT_AXIS)) {
      const axis = config.axes.get(k)
      if (axis != null) return true
    }

    if (allowTypes.includes(EXTRUDER_AXIS)) {
      const componentType = config.getIn(['components', k, 'type'])
      return componentType === EXTRUDER
    }
  },
)

export default axisExists
