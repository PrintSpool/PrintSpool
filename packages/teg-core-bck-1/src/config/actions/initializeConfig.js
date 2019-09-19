export const INITIALIZE_CONFIG = '/teg/config/INITIALIZE_CONFIG'

const initializeConfig = ({
  config,
  pluginLoader,
  availablePlugins,
  previousFatalException,
}) => ({
  type: INITIALIZE_CONFIG,
  payload: {
    config,
    pluginLoader,
    availablePlugins,
    previousFatalException,
  },
})

export default initializeConfig
