export const SET_CONFIG = 'teg/config/SET_CONFIG'

const setConfig = ({
  config,
  plugins,
  onComplete,
  onError,
  error,
}) => {
  const validationPayload = {
    config,
    plugins,
  }

  /*
   * validate each plugin configuration
   */
  plugins.forEach((plugin) => {
    if (typeof plugin.configValidation === 'function') {
      plugin.configValidation().validateSync(validationPayload)
    }
  })

  return {
    type: SET_CONFIG,
    payload: {
      ...validationPayload,
      onComplete,
      onError,
      error,
    },
  }
}

export default setConfig
