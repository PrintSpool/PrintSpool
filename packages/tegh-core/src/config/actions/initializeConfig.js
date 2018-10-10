export const INITIALIZE_CONFIG = '/tegh/config/INITIALIZE_CONFIG'

const initializeConfig = ({
  config,
  pluginLoader,
}) => ({
  type: INITIALIZE_CONFIG,
  payload: {
    config,
    pluginLoader,
  },
})

export default initializeConfig
