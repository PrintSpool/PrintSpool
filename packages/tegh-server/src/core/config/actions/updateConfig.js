import immutablePatch from 'immutablepatch'

import getPluginManager from '../selectors/getPluginManager'

export const UPDATE_CONFIG = 'tegh/config/UPDATE_CONFIG'

const updateConfig = ({
  patch,
  initialLoad = false,
}) => (
  async (dispatch, getState) => {
    const previousConfig = getState().config
    const config = immutablePatch(previousConfig, patch)

    // TODO: set config.macroPluginsByMacroName
    // const macroPluginsByMacroName = {}
    // Object.entries(config.macros).forEach(([pluginName, opts]) => {
    //   const plugin = loadPlugin(pluginName)
    //   Object.entries(plugin)
    //     .filter(([name]) => opts === 'all' || opts.includes(name))
    //     .forEach(([name]) => {
    //       macroPluginsByMacroName[name] = pluginName
    //     })
    // })


    const action = {
      type: UPDATE_CONFIG,
      payload: {
        patch,
        config,
        initialLoad,
      },
    }

    /* load new plugins before the action */
    const pluginManager = getPluginManager(config)
    await pluginManager.preloadAllPlugins()

    await dispatch(action)

    /* unload old plugins after the action */
    // eslint-disable-next-line no-underscore-dangle
    getPluginManager._cache.delete(previousConfig)

    return action
  }
)

export default updateConfig
