import { isImmutable, Map } from 'immutable'
import Config from '../types/Config'

export const REQUEST_SET_CONFIG = 'teg/config/REQUEST_SET_CONFIG'

const requestSetConfig = (params) => {
  const { onComplete, onError, error } = params
  let { config } = params

  if (!isImmutable(config)) config = Config(config)
  // Multimachine stop gap
  config = config.set('machines', Map({ [config.printer.id]: config.printer }))

  return {
    type: REQUEST_SET_CONFIG,
    payload: {
      config,
      onComplete,
      onError,
      error,
    },
  }
}

export default requestSetConfig
