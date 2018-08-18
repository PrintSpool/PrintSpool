import { loop, Cmd } from 'redux-loop'
import { mergeChildReducers } from 'redux-loop-immutable'
import { isImmutable } from 'immutable'
import immutablePatch from 'immutablepatch'

import pluginManagerReducer from '../../pluginManager/reducers/pluginManagerReducer'

import getAllPlugins from '../../pluginManager/selectors/getAllPlugins'

import Config, { validateCoreConfig } from '../types/Config'
import ConfigForm from '../types/ConfigForm'

import { REQUEST_SET_CONFIG } from '../actions/requestSetConfig'
import { REQUEST_PATCH_CONFIG } from '../actions/requestPatchConfig'
import setConfig from '../actions/setConfig'

import requestLoadPlugins from '../../pluginManager/actions/requestLoadPlugins'
import { LOAD_PLUGINS } from '../../pluginManager/actions/loadPlugins'
import unloadPlugins, { UNLOAD_PLUGINS } from '../../pluginManager/actions/unloadPlugins'

const initialState = Config()

const configReducer = (state = initialState, action) => {
  let nextState = mergeChildReducers(state, action, {
    pluginManager: pluginManagerReducer,
  })

  switch (action.type) {
    case REQUEST_SET_CONFIG:
    case REQUEST_PATCH_CONFIG: {
      const { server } = action.payload

      let { configForm } = action.payload

      if (action.type === REQUEST_PATCH_CONFIG) {
        configForm = immutablePatch(nextState.configForm, action.payload.patch)
      }

      if (!isImmutable(configForm)) configForm = ConfigForm(configForm)

      // merge configForm into `config.configForm`
      nextState = nextState.merge({ configForm })

      if (server != null) {
        nextState = nextState.set('server', server)
      }

      const plugins = getAllPlugins(state).keys()

      return loop(nextState, Cmd.action(unloadPlugins(plugins)))
    }
    case UNLOAD_PLUGINS: {
      /*
       * merge configForm into top-level `config` only *AFTER* the previous
       * plugins have been unloaded. Merging the configs before the plugins are
       * unloaded could cause a race condition with an unrelated action.
       */
      nextState = nextState.merge(nextState.configForm)

      validateCoreConfig(nextState)

      return loop(nextState, Cmd.action(requestLoadPlugins()))
    }
    case LOAD_PLUGINS: {
      nextState = nextState.set('isInitialized', true)

      return loop(nextState, Cmd.action(setConfig()))
    }
    default: {
      return nextState
    }
  }
}

export default configReducer
