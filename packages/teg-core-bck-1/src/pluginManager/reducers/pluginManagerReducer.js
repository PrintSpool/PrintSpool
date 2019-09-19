import { Record } from 'immutable'
import { loop, Cmd } from 'redux-loop'

import loadPlugins from '../sideEffects/loadPlugins'

import setConfig from '../../config/actions/setConfig'
import { INITIALIZE_CONFIG } from '../../config/actions/initializeConfig'
import requestSetConfig, { REQUEST_SET_CONFIG } from '../../config/actions/requestSetConfig'

export const initialState = Record({
  pluginLoader: null,
  availablePlugins: [],
})()

/*
 * manages the loading of Teg plugins
 */
const pluginManagerReducer = (state = initialState, action) => {
  switch (action.type) {
    case INITIALIZE_CONFIG: {
      const {
        config,
        pluginLoader,
        availablePlugins,
        previousFatalException,
      } = action.payload

      const nextState = state
        .set('pluginLoader', pluginLoader)
        .set('availablePlugins', availablePlugins)

      let error
      if (previousFatalException != null) {
        const { message, stack } = previousFatalException
        error = {
          code: 'fatal_error',
          message,
          stack,
        }
      }

      return loop(
        nextState,
        Cmd.action(
          requestSetConfig({ config, error }),
        ),
      )
    }
    case REQUEST_SET_CONFIG: {
      const {
        config,
        onComplete,
        onError,
        error,
      } = action.payload

      return loop(state, Cmd.run(loadPlugins, {
        args: [{
          pluginLoader: state.pluginLoader,
          config,
          onComplete,
          onError,
          error,
        }],
        successActionCreator: setConfig,
      }))
    }
    default: {
      return state
    }
  }
}

export default pluginManagerReducer
