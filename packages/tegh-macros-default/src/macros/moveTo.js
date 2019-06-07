import { createMacroExpansionReducer } from '@tegh/core'

import move from '../util/move'

const meta = {
  package: '@tegh/macros-default',
  macro: 'moveTo',
}

// example useage: { moveTo: { positions: { [id]: 100 } } }
const moveTo = createMacroExpansionReducer(meta, (
  { positions, sync },
  { config },
) => {
  const moveArgs = {
    axes: positions,
    sync,
    allowExtruderAxes: false,
    relativeMovement: false,
  }
  return move(moveArgs, { config })
})

export default moveTo
