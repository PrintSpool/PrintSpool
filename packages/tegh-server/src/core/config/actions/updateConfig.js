import immutablePatch from 'immutablepatch'

export const UPDATE_CONFIG = 'tegh/config/UPDATE_CONFIG'

const updateConfig = ({
  patch,
  initialLoad = false,
}) => (
  (dispatch, getState) => {
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

    return dispatch(action)
  }
)

export default updateConfig
