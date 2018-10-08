import { Record } from 'immutable'

import { INITIALIZE_CONFIG } from '../actions/initializeConfig'
import { SET_CONFIG } from '../actions/setConfig'

const initialState = Record({
  serverSettings: null,
  props: null,
})()

const configReducer = (state = initialState, action) => {
  switch (action.type) {
    case INITIALIZE_CONFIG: {
      const { serverSettings } = action.payload

      return state.set('serverSettings', serverSettings)
    }
    case SET_CONFIG: {
      const { config } = action.payload

      return state.set('props', config)
    }
    default: {
      return state
    }
  }
}

export default configReducer
