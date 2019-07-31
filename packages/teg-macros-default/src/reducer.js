import { Record, Map } from 'immutable'
import { mergeChildReducers } from '@d1plo1d/redux-loop-immutable'

import delay from './macros/delay'
import home from './macros/home'
import moveBy from './macros/moveBy'
import moveTo from './macros/moveTo'
import noOp from './macros/noOp'
import setMaterials from './macros/setMaterials'
import setTargetTemperatures from './macros/setTargetTemperatures'
import toggleFans from './macros/toggleFans'
import toggleHeaters from './macros/toggleHeaters'
import toggleMotorsEnabled from './macros/toggleMotorsEnabled'

const reducers = {
  delay,
  home,
  moveBy,
  moveTo,
  noOp,
  setMaterials,
  setTargetTemperatures,
  toggleFans,
  toggleHeaters,
  toggleMotorsEnabled,
}

export const initialState = Record(
  Map(reducers).map(() => undefined).toJS(),
)()

const reducer = (state = initialState, action) => (
  mergeChildReducers(state, action, reducers)
)

export default reducer
