import { UPDATE_CONFIG } from '../actions/updateConfig'

const initialState = null

const configReducer = (state = initialState, action) => {
  switch (action) {
    case UPDATE_CONFIG: {
      return action.payload.config
    }
    default: {
      return state
    }
  }
}

export default configReducer
