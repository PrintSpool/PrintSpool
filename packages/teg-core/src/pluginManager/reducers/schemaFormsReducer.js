import { Record, Map } from 'immutable'
import { SET_CONFIG } from '../../config/actions/setConfig'
import getSchemaForms from '../selectors/getSchemaForms'

export const initialState = Record({
  machine: null,
  auth: Map(),
  plugins: Map(),
  materials: Map(),
  components: Map(),
})()

const schemaFormsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const schemaForms = getSchemaForms(action.payload)

      return schemaForms
    }
    default: {
      return state
    }
  }
}

export default schemaFormsReducer
