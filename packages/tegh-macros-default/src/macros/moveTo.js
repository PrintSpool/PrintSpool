import { createMacroExpansionReducer } from 'tegh-core'

import move from '../util/move'

const moveTo = createMacroExpansionReducer('moveTo', (
  args,
  { config },
) => {
  const moveArgs = {
    axes: args,
    allowExtruderAxes: false,
    relativeMovement: false,
  }
  return move(moveArgs, { config })
})

export default moveTo
