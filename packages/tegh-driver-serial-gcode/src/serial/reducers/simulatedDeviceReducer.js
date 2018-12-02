import { loop, Cmd } from 'redux-loop'

import {
  SET_CONFIG,
  getController,
} from 'tegh-core'

import createSimulatedDevice from '../sideEffects/createSimulatedDevice'

export const initialState = null

const simulatedDeviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const controllerConfig = getController(config).model

      if (controllerConfig.simulate) {
        return loop(
          state,
          Cmd.run(createSimulatedDevice, { args: [controllerConfig] }),
        )
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default simulatedDeviceReducer
