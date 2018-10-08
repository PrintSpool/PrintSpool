export const SET_CONFIG = 'tegh/config/SET_CONFIG'

const setConfig = ({ config, plugins }) => ({
  type: SET_CONFIG,
  payload: {
    config,
    plugins,
  }
})

export default setConfig
