import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import listenForUSR2 from '../sideEffects/listenForUSR2'
import shutdownForUpdates from '../sideEffects/shutdownForUpdates'

import { INITIALIZE_CONFIG } from '../../config/actions/initializeConfig'
import { JOB_QUEUE_COMPLETE } from '../../jobQueue/actions/jobQueueComplete'
import { REQUEST_CREATE_JOB } from '../../jobQueue/actions/requestCreateJob'
import { CREATE_JOB } from '../../jobQueue/actions/createJob'

import { REQUEST_SET_CONFIG } from '../../config/actions/requestSetConfig'

import { USR2_RECEIVED } from '../actions/usr2Received'
import approveUpdates, { APPROVE_UPDATES } from '../actions/approveUpdates'

export const initialState = Record({
  hasPendingUpdates: false,
  updating: false,
  jobQueueEmpty: true,
})()

const updatesReducer = (state = initialState, action) => {
  switch (action.type) {
    case INITIALIZE_CONFIG: {
      return loop(
        state,
        Cmd.run(listenForUSR2, { args: [Cmd.dispatch] }),
      )
    }
    case USR2_RECEIVED: {
      let nextState = state.merge({
        hasPendingUpdates: true,
      })

      if (state.jobQueueEmpty) {
        nextState = nextState.merge({
          updating: true,
        })

        return loop(nextState, Cmd.action(approveUpdates()))
      }

      const pendingUpdateMsg = 'Pending updates awaiting empty job queue'

      return loop(
        nextState,
        // eslint-disable-next-line no-console
        Cmd.run(console.error, { args: [pendingUpdateMsg] }),
      )
    }
    case JOB_QUEUE_COMPLETE: {
      let nextState = state.merge({
        jobQueueEmpty: true,
      })

      if (state.hasPendingUpdates) {
        nextState = nextState.merge({
          updating: true,
        })

        return loop(nextState, Cmd.action(approveUpdates()))
      }

      return nextState
    }
    case APPROVE_UPDATES: {
      return loop(
        state,
        Cmd.run(shutdownForUpdates),
      )
    }
    case REQUEST_CREATE_JOB: {
      if (state.updating) {
        throw new Error('Cannot create a job while updating Teg')
      }

      return state
    }
    case REQUEST_SET_CONFIG: {
      if (state.hasPendingUpdates) {
        throw new Error(
          'Cannot modify configs while updates are pending. Please empty the '
          + 'job queue so Teg can finish updating.',
        )
      }

      return state
    }
    case CREATE_JOB: {
      return state.merge({
        jobQueueEmpty: false,
      })
    }
    default: {
      return state
    }
  }
}

export default updatesReducer
