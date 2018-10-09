import getPluginsByMacroName from '../../pluginManager/selectors/getPluginsByMacroName'

export const SET_CONFIG = 'tegh/config/SET_CONFIG'

const setConfig = ({ config, plugins }) => {
  const payload = { config, plugins }
  /*
   * validate each plugin configuration
   */
  plugins.forEach((plugin) => {
    if (plugin.validateConfig) plugin.validateConfig(config)
  })

  /*
   * run the getPluginsByMacroName selector to validate that all the macros
   * are valid
   */
  getPluginsByMacroName(payload)

  return {
    type: SET_CONFIG,
    payload,
  }
}

export default setConfig
