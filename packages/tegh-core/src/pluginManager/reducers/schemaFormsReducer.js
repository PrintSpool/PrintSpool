import { SET_CONFIG } from '../../config/actions/setConfig'
import getSchemaForms from '../selectors/getSchemaForms'

export const initialState = null

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
