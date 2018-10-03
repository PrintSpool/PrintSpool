import { SPOOL_TASK } from 'tegh-core'

import { throwErrorOnInvalidGCode } from '../../txParser'

const throwOnInvalidGCodeReducer = (state = null, action) => {
  switch (action.type) {
    case SPOOL_TASK: {
      throwErrorOnInvalidGCode(action.payload.task.data)
      return state
    }
    default: {
      return state
    }
  }
}

export default throwOnInvalidGCodeReducer
