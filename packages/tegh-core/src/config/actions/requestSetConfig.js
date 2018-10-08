export const REQUEST_SET_CONFIG = 'tegh/config/REQUEST_SET_CONFIG'

const requestSetConfig = ({
  config,
}) => ({
  type: REQUEST_SET_CONFIG,
  payload: { config },
})

export default requestSetConfig
