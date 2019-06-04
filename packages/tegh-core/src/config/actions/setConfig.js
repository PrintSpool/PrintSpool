export const SET_CONFIG = 'tegh/config/SET_CONFIG'

const setConfig = ({
  config,
  plugins,
  onComplete,
  onError,
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
    },
  }
}

export default setConfig
