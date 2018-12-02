import { isImmutable } from 'immutable'
import Config from '../types/Config'

export const REQUEST_SET_CONFIG = 'tegh/config/REQUEST_SET_CONFIG'

const requestSetConfig = (params) => {
  let { config } = params

  if (!isImmutable(config)) config = Config(config)

  return {
    type: REQUEST_SET_CONFIG,
    payload: { config },
  }
}

export default requestSetConfig
