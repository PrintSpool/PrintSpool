import { loop, Cmd } from 'redux-loop'

import {
  SET_CONFIG,
  getController,
} from 'tegh-core'

import getSerialPortID from '../selectors/getSerialPortID'
import createSimulatedDevice from '../sideEffects/createSimulatedDevice'

export const initialState = null

const simulatedDeviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const controllerConfig = getController(config).model
      const serialPortID = getSerialPortID(config)

      if (controllerConfig.get('simulate')) {
        return loop(
          state,
          Cmd.run(createSimulatedDevice, { args: [serialPortID] }),
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
