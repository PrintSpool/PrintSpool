import { loop, Cmd } from 'redux-loop'
import { Record, Set } from 'immutable'

import {
  SET_CONFIG,
  DESPOOL_TASK,
  requestDespool,
  getPluginModels,
  isMacroEnabled,
} from '@tegh/core'

import setupPins from '../sideEffects/setupPins'
import setGPIOs from '../sideEffects/setGPIOs'

import gpioSetupComplete, { GPIO_SETUP_COMPLETE } from '../actions/gpioSetupComplete'
import gpioError from '../actions/gpioError'

export const MACRO = 'setGPIOs'

const initialState = Record({
  enabled: false,
  isSetup: false,
  outputPins: Set(),
})()

const meta = {
  package: '@tegh/raspberry-pi',
  macro: MACRO,
}

/*
 * sets the value of a gpio output pin
 * Takes an object of gpios:
 *  key: the pin number to set
 *  value: the on/off boolean value of the pin
 *
 * example use: { setGPIOs: { gpios: {4: true} } }
 */
const gpioReducer = (state, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const model = getPluginModels(config).get(meta.package)

      const enabled = isMacroEnabled({ config, meta })

      if (!enabled) {
        return initialState.merge({
          enabled,
        })
      }

      const outputPins = Set(model.get('outputPins'))

      const nextState = initialState.merge({
        enabled,
        outputPins,
      })

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

      if (macro === MACRO) {
        const { gpios } = args

        if (!state.enabled) {
          return state
        }

        if (!state.isSetup) {
          throw new Error('Cannot setGPIO before setup is completed')
        }

        Object.entries(gpios).forEach(([pin, value]) => {
          if (!state.outputPins.includes(pin)) {
            throw new Error(`GPIO pin not configured: ${pin}`)
          }

          if (typeof value !== 'boolean') {
            throw new Error(`Invalid setGPIO value: ${value}`)
          }
        })

        return loop(
          state,
          Cmd.run(setGPIOs, {
            successActionCreator: requestDespool,
            failActionCreator: gpioError,
          }),
        )
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default gpioReducer
