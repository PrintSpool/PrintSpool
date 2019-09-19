import { loop, Cmd } from 'redux-loop'

import { SET_CONFIG } from '../actions/setConfig'
import driverError from '../../printer/actions/driverError'

export const initialState = null

const statusReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { error } = action.payload

      if (error == null) {
        return state
      }

      const nextAction = driverError(error)

      return loop(
        state,
        Cmd.action(nextAction),
      )
    }
    default: {
      return state
    }
  }
}

export default statusReducer
