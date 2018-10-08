import { SET_CONFIG } from '../actions/setConfig'

export const initialState = null

const configReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      return config
    }
    default: {
      return state
    }
  }
}

export default configReducer
