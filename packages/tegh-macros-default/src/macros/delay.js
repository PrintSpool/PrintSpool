import { loop, Cmd } from 'redux-loop'
import Promise from 'bluebird'

import {
  despoolCompleted,
  DESPOOL_TASK,
} from '@tegh/core'

export const DELAY = 'delay'

/*
 * delays execution of the next gcode by a number of milliseconds
 * args:
 *  period: the number of milliseconds to wait
 *
 * example use: { delay: { period: 5000 } }
 */
const delayReducer = (state, action) => {
  switch (action.type) {
    case DESPOOL_TASK: {
      const { macro, args } = action.payload

      if (macro === DELAY) {
        return loop(state, Cmd.run(Promise.delay, {
          args: [args.period],
          successActionCreator: despoolCompleted,
        }))
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default delayReducer
