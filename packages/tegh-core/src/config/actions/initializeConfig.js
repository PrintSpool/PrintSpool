export const INITIALIZE_CONFIG = '/tegh/config/INITIALIZE_CONFIG'

const initializeConfig = ({
  config,
  serverSettings,
  pluginLoaderPath,
}) => ({
  type: INITIALIZE_CONFIG,
  payload: {
    config,
    serverSettings,
    pluginLoaderPath,
  },
})

export default initializeConfig
