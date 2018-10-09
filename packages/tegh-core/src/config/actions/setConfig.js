export const SET_CONFIG = 'tegh/config/SET_CONFIG'

const setConfig = ({ config, plugins }) => {
  const payload = { config, plugins }
  /*
   * validate each plugin configuration
   */
  plugins.forEach((plugin) => {
    if (plugin.validateConfig) plugin.validateConfig(config)
  })

  return {
    type: SET_CONFIG,
    payload,
  }
}

export default setConfig
