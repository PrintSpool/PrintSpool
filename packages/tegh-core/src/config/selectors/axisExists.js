import { createSelector } from 'reselect'
import { MOVEMENT_AXIS, EXTRUDER_AXIS } from '../types/AxisTypeEnum'
import { EXTRUDER } from '../types/PeripheralTypeEnum'

const axisExists = createSelector(
  config => config,
  config => (k, { allowTypes }) => {
    if (allowTypes.includes(MOVEMENT_AXIS)) {
      const axis = config.machine.axes.get(k)
      if (axis != null) return true
    }

    if (allowTypes.includes(EXTRUDER_AXIS)) {
      const peripheral = config.machine.peripherals.get(k)
      return peripheral != null && peripheral.get(k).type === EXTRUDER
    }
  },
)

export default axisExists
