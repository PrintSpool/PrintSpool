import { loop, Cmd } from 'redux-loop'

/* config actions */
import requestSpoolJobFile from '../../spool/actions/requestSpoolJobFile'
import requestSpoolNextJobFile from '../../spool/actions/requestSpoolNextJobFile'
import despoolCompleted from '../../spool/actions/despoolCompleted'
import { DESPOOL_TASK } from '../../spool/actions/despoolTask'

const jobQueueMacrosReducer = (state, action) => {
  switch (action.type) {
    case DESPOOL_TASK: {
      const { macro, args, task } = action.payload
      let nextAction = null

      switch (macro) {
        case 'spoolNextJobFile': {
          nextAction = requestSpoolNextJobFile()
          break
        }
        case 'spoolJobFile': {
          nextAction = requestSpoolJobFile(args)
          break
        }
        default: {
          return
        }
      }

      return loop(
        state,
        Cmd.list([
          Cmd.action(nextAction),
          Cmd.action(despoolCompleted({ task })),
        ]),
      )
    }
    default: {
      return state
    }
  }
}

export default jobQueueMacrosReducer
