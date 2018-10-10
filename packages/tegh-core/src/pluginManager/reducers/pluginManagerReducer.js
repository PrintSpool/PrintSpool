import { Record } from 'immutable'
import { loop, Cmd } from 'redux-loop'

import loadPlugins from '../sideEffects/loadPlugins'

import setConfig from '../../config/actions/setConfig'
import { INITIALIZE_CONFIG } from '../../config/actions/initializeConfig'
import requestSetConfig, { REQUEST_SET_CONFIG } from '../../config/actions/requestSetConfig'

export const initialState = Record({
  pluginLoader: null,
})()

/*
 * manages the loading of Tegh plugins
 */
const pluginManagerReducer = (state = initialState, action) => {
  console.log('plugin??')
  switch (action.type) {
    case INITIALIZE_CONFIG: {
      const { config, pluginLoader } = action.payload

      const nextState = state.set('pluginLoader', pluginLoader)

      return loop(
        nextState,
        Cmd.action(
          requestSetConfig({ config }),
        ),
      )
    }
    case REQUEST_SET_CONFIG: {
      const { config } = action.payload

      return loop(state, Cmd.run(loadPlugins, {
        args: [{
          pluginLoader: state.pluginLoader,
          config,
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
