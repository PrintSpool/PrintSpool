export const INITIALIZE_CONFIG = '/teg/config/INITIALIZE_CONFIG'

const initializeConfig = ({
  config,
  pluginLoader,
  availablePlugins,
}) => ({
  type: INITIALIZE_CONFIG,
  payload: {
    config,
    pluginLoader,
    availablePlugins,
  },
})

export default initializeConfig
