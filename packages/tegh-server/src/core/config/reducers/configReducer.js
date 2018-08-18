import Config, { validateConfig } from '../types/Config'

import { BEFORE_SET_CONFIG } from '../actions/setConfig'

const initialState = Config()

const configReducer = (state = initialState, action) => {
  switch (action) {
    case BEFORE_SET_CONFIG: {
      const {
        configForm,
        server,
      } = action.payload

      let nextState = state
        .merge(configForm)
        .merge({
          isInitialized: true,
          configForm,
        })

      validateConfig(nextState)

      if (server != null) {
        nextState = nextState.set('server', server)
      }

      return nextState
    }
    default: {
      return state
    }
  }
}

export default configReducer
