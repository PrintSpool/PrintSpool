import { List } from 'immutable'
import loadConfigOrSetDefault from './config/sideEffects/loadConfigOrSetDefault'

export uuid from 'uuid'

export SerialPort from './util/SerialPort'

export * from './actions'
export * from './types'
export * from './selectors'

export authenticate from './auth/sideEffects/authenticate'
export loadConfigOrSetDefault from './config/sideEffects/loadConfigOrSetDefault'

export executableSchema from './executableSchema/executableSchema'
export createTegHostStore from './executableSchema/createTegHostStore'

export getSchemaForms from './getSchemaForms'

export configValidation from './configValidation'

export createMacroExpansionReducer from './macros/reducers/createMacroExpansionReducer'

export const macros = () => List([
  'spoolJobFile',
  'spoolNextJobFile',
])
