import { List } from 'immutable'
import { SET_CONFIG } from '../../config/actions/setConfig'

export const initialState = List()

const fixedListComponentTypesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      return action.payload.plugins
        .map(plugin => plugin.fixedListComponentTypes)
        .filter(types => types != null)
        .reduce((types, acc) => acc.concat(types), List())
    }
    default: {
      return state
    }
  }
}

export default fixedListComponentTypesReducer
