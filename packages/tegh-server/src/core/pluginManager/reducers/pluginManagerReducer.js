import Config, { validateConfig } from '../types/Config'

import getPluginsByMacroName from '../selectors/getPluginsByMacroName'
import { BEFORE_SET_CONFIG } from '../actions/setConfig'
import { SET_PLUGIN_LOADER_PATH } from '../actions/setPluginLoaderPath'

const initialState = Record({
  pluginLoaderPath: null,
})()

const pluginManagerReducer = (state = initialState, action) => {
  switch (action) {
    case SET_PLUGIN_LOADER_PATH: {
      return state.set('pluginLoaderPath', action.payload.pluginLoaderPath)
    }
    case BEFORE_SET_CONFIG: {
      /*
       * run the getPluginsByMacroName selector to validate that all the macros
       * are valid
       */
       // TODO: action.config will not be updated yet. Figure out how to
       // get the correct config to this reducer.
      getPluginsByMacroName(action.config)

      return nextState
    }
    default: {
      return state
    }
  }
}

export default pluginManagerReducer


import memoize from 'fast-memoize'

/*
 * This selector contains all the code for loading Tegh plugins.
 */
const getPluginManager = (config) => {
  let initialized = false
  const pluginCache = {}

  const preloadAllPlugins = async () => {
    if (config == null) {
      throw new Error('config cannot be null')
    }
    const { pluginLoaderPath } = config

    if (pluginLoaderPath == null) {
      throw new Error('pluginLoaderPath must be defined')
    }

    const loadPlugin = await import(pluginLoaderPath)

    const loadPluginToCache = async (plugin) => {
      pluginCache[plugin.package] = await loadPlugin(plugin.package)
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const plugin of config.plugins) {
      // eslint-disable-next-line no-await-in-loop
      await loadPluginToCache(plugin)
    }

    initialized = true
  }

  return {
    preloadAllPlugins,
    pluginCache,
    isReady: () => initialized,
  }
}

export default memoize(getPluginManager)
