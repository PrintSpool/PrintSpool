export const INITIALIZE_CONFIG = '/tegh/config/INITIALIZE_CONFIG'

const initializeConfig = ({
  serverSettings,
  config,
  pluginLoaderPath,
}) => ({
  type: INITIALIZE_CONFIG,
  payload: {
    serverSettings,
    config,
    pluginLoaderPath,
  },
})

export default initializeConfig
