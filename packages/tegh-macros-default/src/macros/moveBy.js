import { createMacroExpansionReducer } from 'tegh-core'

import move from '../util/move'

const meta = {
  package: 'tegh-macros-default',
  macro: 'moveBy',
}

const moveBy = createMacroExpansionReducer(meta, (
  args,
  { config },
) => {
  const moveArgs = {
    axes: args,
    allowExtruderAxes: true,
    relativeMovement: true,
  }
  return move(moveArgs, { config })
})

export default moveBy
