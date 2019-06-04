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
 * manages the loading of Tegh plugins
 */
const pluginManagerReducer = (state = initialState, action) => {
  switch (action.type) {
    case INITIALIZE_CONFIG: {
      const { config, pluginLoader, availablePlugins } = action.payload

      const nextState = state
        .set('pluginLoader', pluginLoader)
        .set('availablePlugins', availablePlugins)

      return loop(
        nextState,
        Cmd.action(
          requestSetConfig({ config }),
        ),
      )
    }
    case REQUEST_SET_CONFIG: {
      const { config, onComplete, onError } = action.payload

      return loop(state, Cmd.run(loadPlugins, {
        args: [{
          pluginLoader: state.pluginLoader,
          config,
          onComplete,
          onError,
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
