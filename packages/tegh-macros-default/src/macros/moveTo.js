import { createMacroExpansionReducer } from '@tegh/core'

import move from '../util/move'

const meta = {
  package: '@tegh/macros-default',
  macro: 'moveTo',
}

const moveTo = createMacroExpansionReducer(meta, (
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
