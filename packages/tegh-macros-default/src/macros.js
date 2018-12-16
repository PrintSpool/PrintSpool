import { initialState } from './reducer'

// an array of the names of the macros
const macros = initialState
  .toMap()
  .keySeq()
  .toList()

export default macros
