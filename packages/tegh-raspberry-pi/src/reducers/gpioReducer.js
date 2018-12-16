import { loop, Cmd } from 'redux-loop'
import { Record, Set } from 'immutable'
import gpio, { promise as gpiop } from 'gpio'

import {
  SET_CONFIG,
  DESPOOL_TASK,
  requestDespool,
  getPluginModels,
} from 'tegh-core'

import setupPins from '../sideEffects/setupPins'

import gpioSetupComplete, { GPIO_SETUP_COMPLETE } from '../actions/gpioSetupComplete'
import gpioError from '../actions/gpioError'

export const SET_GPIO = 'setGPIO'

const initialState = Record({
  isSetup: false,
  outputPins: Set(),
})

/*
 * sets the value of a gpio output pin
 * args:
 *  pin: the pin number to set
 *  value: the value of the pin
 *
 * example use: setGPIO { pin: 12, 1 }
 */
const gpioReducer = (state, action) => {
  switch (action) {
    case SET_CONFIG: {
      const { config } = action.payload
      const model = getPluginModels(config).get('tegh-raspberry-pi')

      const outputPins = Set(model.get('outputPins'))

      const nextState = initialState.set('outputPins', outputPins)

      return loop(nextState, Cmd.run(setupPins, {
        args: [{ outputPins }],
        successActionCreator: gpioSetupComplete,
        failActionCreator: gpioError,
      }))
    }
    case GPIO_SETUP_COMPLETE: {
      return state.set('isSetup', true)
    }
    case DESPOOL_TASK: {
      const { macro, args } = action.payload

      if (macro === SET_GPIO) {
        const { pin, value } = args

        if (!state.isSetup) {
          throw new Error('Cannot setGPIO before setup is completed')
        }

        if (!state.outputPins.includes(pin)) {
          throw new Error(`GPIO pin not configured: ${pin}`)
        }

        if (typeof value !== 'number') {
          throw new Error(`Invalid setGPIO value: ${value}`)
        }

        return loop(state, Cmd.run(gpiop.write, {
          args: [pin, value],
          successActionCreator: requestDespool,
          failActionCreator: gpioError,
        }))
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default gpioReducer
