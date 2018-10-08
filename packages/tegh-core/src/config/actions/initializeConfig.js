export const INITIALIZE_CONFIG = '/tegh/config/INITIALIZE_CONFIG'

const initializeConfig = ({
  config,
  pluginLoaderPath,
}) => ({
  type: INITIALIZE_CONFIG,
  payload: {
    config,
    pluginLoaderPath,
  },
})

export default initializeConfig
