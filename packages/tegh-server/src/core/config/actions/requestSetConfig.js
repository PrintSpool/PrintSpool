export const REQUEST_SET_CONFIG = 'tegh/config/REQUEST_SET_CONFIG'

const requestSetConfig = ({
  configForm,
}) => ({
  type: REQUEST_SET_CONFIG,
  payload: { configForm },
})

export default requestSetConfig
