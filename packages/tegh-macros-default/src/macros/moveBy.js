import { createMacroExpansionReducer } from '@tegh/core'

import move from '../util/move'

const meta = {
  package: '@tegh/macros-default',
  macro: 'moveBy',
}

// example useage: { moveBy: { distances: { [id]: 100 } } }
const moveBy = createMacroExpansionReducer(meta, (
  { distances, sync },
  { config },
) => {
  const moveArgs = {
    axes: distances,
    sync,
    allowExtruderAxes: true,
    relativeMovement: true,
  }
  return move(moveArgs, { config })
})

export default moveBy
