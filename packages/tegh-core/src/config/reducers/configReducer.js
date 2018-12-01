import { loop, Cmd } from 'redux-loop'

import { SET_CONFIG } from '../actions/setConfig'
import saveConfig from '../sideEffects/saveConfig'

export const initialState = null

const configReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      // If the config is being changed by a user then save it to disk.
      if (state != null) {
        return loop(
          config,
          Cmd.run(saveConfig, {
            args: [{ config }],
          }),
        )
      }

      return config
    }
    default: {
      return state
    }
  }
}

export default configReducer
