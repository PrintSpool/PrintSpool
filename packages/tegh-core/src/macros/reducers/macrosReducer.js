import { Record, List } from 'immutable'

import { SET_CONFIG } from '../../config/actions/setConfig'

import getEnabledHostMacros from '../../pluginManager/selectors/getEnabledHostMacros'

export const initialState = Record({
  enabledMacros: List(),
})()

const macrosReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const enabledMacros = getEnabledHostMacros(action.payload)
      console.log(state)
      return state.merge({
        enabledMacros,
      })
    }
    default: {
      return state
    }
  }
}

export default macrosReducer
