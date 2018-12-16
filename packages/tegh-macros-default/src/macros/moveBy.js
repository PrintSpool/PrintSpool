import { createMacroExpansionReducer } from 'tegh-core'

import move from '../util/move'

const moveBy = createMacroExpansionReducer('moveBy', (
  args,
  { config },
) => {
  const moveArgs = {
    axes: args,
    allowExtruderAxes: true,
    relativeMovement: true,
  }
  console.log(moveArgs)
  return move(moveArgs, { config })
})

export default moveBy
