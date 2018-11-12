import { createSelector } from 'reselect'
import getPrinterConfig from './getPrinterConfig'
import { MOVEMENT_AXIS, EXTRUDER_AXIS } from '../types/AxisTypeEnum'
import { TOOLHEAD, AXIS } from '../types/components/ComponentTypeEnum'

const axisExists = createSelector(
  getPrinterConfig,
  config => (k, { allowTypes }) => {
    const componentType = config.components.find(c => c.address === k).type

    if (allowTypes.includes(MOVEMENT_AXIS) && componentType === AXIS) {
      return true
    }

    if (allowTypes.includes(EXTRUDER_AXIS) && componentType === TOOLHEAD) {
      return true
    }
  },
)

export default axisExists
