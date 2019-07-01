import { Map } from 'immutable'

import { initialState } from './reducer'

// an array of the names of the macros
const macros = () => (
  Map(initialState)
    .keySeq()
    .toList()
)

export default macros
