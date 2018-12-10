import { SET_CONFIG } from '../../config/actions/setConfig'

export const initialState = null

const driverReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      return action.payload.plugins.keyOf(plugin => plugin.driver)
    }
    default: {
      return state
    }
  }
}

export default driverReducer
