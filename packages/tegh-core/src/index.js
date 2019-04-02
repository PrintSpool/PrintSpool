import { List } from 'immutable'

export uuid from 'uuid'

export SerialPort from './util/SerialPort'

export * from './actions'
export * from './types'
export * from './selectors'

export authenticate from './auth/sideEffects/authenticate'

export executableSchema from './executableSchema/executableSchema'
export createTeghHostStore from './executableSchema/createTeghHostStore'

export getSchemaForms from './getSchemaForms'

export configValidation from './configValidation'

export createMacroExpansionReducer from './macros/reducers/createMacroExpansionReducer'

export const macros = () => List([
  'spoolJobFile',
  'spoolNextJobFile',
])
