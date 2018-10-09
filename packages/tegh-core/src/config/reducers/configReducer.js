import { loop, Cmd } from 'redux-loop'
import immutablePatch from 'immutablepatch'

import { SET_CONFIG } from '../actions/setConfig'
import requestSetConfig from '../actions/requestSetConfig'
import { REQUEST_PATCH_CONFIG } from '../actions/requestPatchConfig'

export const initialState = null

const configReducer = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_PATCH_CONFIG: {
      const { patch } = action.payload

      const config = immutablePatch(state, patch)

      return loop(
        state,
        Cmd.action(requestSetConfig({ config })),
      )
    }
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
