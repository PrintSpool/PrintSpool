import { Map, Record } from 'immutable'

import {
  APOLLO_MUTATION_INIT,
  APOLLO_MUTATION_RESULT,
} from 'apollo-link-redux'

const initialState = Map({})

const webRTCReducer = (state = initialState, action) => {
  switch (action.type) {
    case APOLLO_MUTATION_INIT:
    case APOLLO_MUTATION_RESULT: {
      const { operationName } = action
      return state.set(operationName, Record({
        isUploading: action.type === APOLLO_MUTATION_INIT,
      })())
    }
    default: {
      return state
    }
  }
}

export default webRTCReducer
