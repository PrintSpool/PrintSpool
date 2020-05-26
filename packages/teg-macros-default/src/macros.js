import delay from './macros/delay'
import home from './macros/home'
import moveBy from './macros/moveBy'
import moveTo from './macros/moveTo'
import continuousMove from './macros/continuousMove'
import noOp from './macros/noOp'
import setMaterials from './macros/setMaterials'
import setTargetTemperatures from './macros/setTargetTemperatures'
import toggleFans from './macros/toggleFans'
import toggleHeaters from './macros/toggleHeaters'
import toggleMotorsEnabled from './macros/toggleMotorsEnabled'

const macros = [
  delay,
  home,
  moveBy,
  moveTo,
  continuousMove,
  noOp,
  setMaterials,
  setTargetTemperatures,
  toggleFans,
  toggleHeaters,
  toggleMotorsEnabled,
]

export default macros
