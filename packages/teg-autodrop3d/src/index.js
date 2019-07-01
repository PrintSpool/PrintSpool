import { List } from 'immutable'
import { combineReducers } from 'redux-loop'

import autodropJobDownloadReducer from './reducers/autodropJobDownloadReducer'
import autodropJobStatusReducer from './reducers/autodropJobStatusReducer'

export const reducer = combineReducers({
  autodropJobDownload: autodropJobDownloadReducer,
  autodropJobStatus: autodropJobStatusReducer,
})

export getSchemaForms from './getSchemaForms'

// an array of the names of the macros
export const macros = () => List([
  'fetchAutodropJob',
])
