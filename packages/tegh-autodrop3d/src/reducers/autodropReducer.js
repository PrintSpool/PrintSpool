import { URL, URLSearchParams } from 'url'
import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  SET_CONFIG,
  PRINTER_READY,
  DESPOOL_TASK,
  JOB_QUEUE_COMPLETE,
  getPluginModels,
  requestCreateJob,
  getTaskPercentComplete,
} from '@tegh/core'

import pollAutodrop, { POLL_AUTODROP } from '../actions/pollAutodrop'
import markAutodropJobAsDone, { MARK_AUTODROP_JOB_AS_DONE } from '../actions/markAutodropJobAsDone'
import fetchComplete, { FETCH_COMPLETE } from '../actions/fetchComplete'
import fetchFail, { FETCH_FAIL } from '../actions/fetchFail'
import autodropJobDone, { AUTODROP_JOB_DONE } from '../actions/autodropJobDone'
import autodropUpdateComplete, { AUTODROP_UPDATE_COMPLETE } from '../actions/autodropUpdateComplete'

import fetchFromAutodrop from '../sideEffects/fetchFromAutodrop'

// state machine
const IDLE = 'IDLE'
const PRINTING = 'PRINTING'
const DONE = 'DONE'

export const initialState = Record({
  // configs
  apiURL: null,
  apiAuth: null,
  // dynamic state
  pollingInitialized: false,
  autodropJobState: IDLE,
  printerIsIdle: false,
  autodropJobID: null,
  teghJobID: null,
  percentComplete: 0,
})()

const PACKAGE = '@tegh/autodrop3d'
const RETRY_DELAY_AFTER_ERROR = 3000
const POLLING_INTERVAL = 500

const DEFAULT_URL = (
  'https://autodrop.sparkhosted.site/api/jobsQueue/printerRequestJob'
)

const resetState = state => (
  initialState.merge({
    apiURL: state.apiURL,
    apiAuth: state.apiAuth,
    pollingInitialized: state.pollingInitialized,
  })
)

const runFetchCmd = ({ state, params, successActionCreator }) => {
  const url = new URL(state.apiURL)

  url.search = new URLSearchParams({
    ...state.apiAuth,
    ...params,
  })
  console.log({
    ...state.apiAuth,
    ...params,
  })

  console.log(url.toString())
  return Cmd.run(
    fetchFromAutodrop,
    {
      args: [{ url: url.toString() }],
      successActionCreator,
      failActionCreator: fetchFail,
    },
  )
}

const runPollingCmd = () => Cmd.run(Promise.delay, {
  args: [POLLING_INTERVAL],
  successActionCreator: pollAutodrop,
})

const pollingLoop = state => loop(
  state,
  runPollingCmd(),
)

const autodropReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const {
        deviceID,
        deviceKey,
        apiURL,
      } = getPluginModels(config).get(PACKAGE).toJS()

      const nextState = initialState.merge({
        apiURL: apiURL || DEFAULT_URL,
        apiAuth: {
          name: deviceID,
          key: deviceKey,
        },
        pollingInitialized: true,
      })

      if (state.pollingInitialized === false) {
        return pollingLoop(nextState)
      }

      return nextState
    }
    case POLL_AUTODROP: {
      const {
        autodropJobID,
        percentComplete,
        autodropJobState,
        printerIsIdle,
      } = state
      console.log('polling', autodropJobState)

      switch (autodropJobState) {
        case IDLE: {
          // do not download any jobs from AutoDrop until the printer is idle
          if (printerIsIdle === false) {
            return pollingLoop(state)
          }

          console.log('WAITING')

          return loop(
            state,
            runFetchCmd({
              state,
              params: {},
              successActionCreator: fetchComplete,
            }),
          )
        }
        case PRINTING: {
          console.log('PROGRESS!!!', percentComplete)

          return loop(
            state,
            runFetchCmd({
              state,
              params: {
                jobID: autodropJobID,
                stat: 'update',
                jobStatus: percentComplete,
              },
              successActionCreator: autodropUpdateComplete,
            }),
          )
        }
        default: {
          return pollingLoop(state)
        }
      }
    }
    case PRINTER_READY: {
      return resetState(state)
        .set('printerIsIdle', true)
    }
    case DESPOOL_TASK: {
      const { task } = action.payload
      const { jobID } = task

      if (jobID == null || jobID !== state.teghJobID) {
        return state
      }

      if (task.currentLineNumber === task.data.size - 1) {
        return loop(state, Cmd.action(markAutodropJobAsDone()))
      }

      const percentComplete = getTaskPercentComplete({ task })

      return state.set('percentComplete', percentComplete)
    }
    case JOB_QUEUE_COMPLETE: {
      console.log('JOB_QUEUE_COMPLETE')

      return state.set('printerIsIdle', true)
    }
    case FETCH_COMPLETE: {
      const content = action.payload
      const lines = content.split('\n')

      console.log(lines.slice(0, 5))
      const autodropIsEmpty = lines[0].indexOf(';START') === -1

      if (autodropIsEmpty) {
        // start polling
        return pollingLoop(state)
      }

      const autodropJobID = lines[2].replace(';', '').trim()

      console.log({ autodropJobID }, lines.length)

      const name = `AUTODROP JOB #${autodropJobID}`

      const nextAction = requestCreateJob({
        name,
        files: [{
          name,
          content,
        }],
      })

      const nextState = state.merge({
        autodropJobState: PRINTING,
        autodropJobID,
        teghJobID: nextAction.payload.job.id,
      })

      return loop(
        nextState,
        Cmd.list([
          Cmd.action(nextAction),
          runPollingCmd(),
        ])
      )
    }
    case AUTODROP_UPDATE_COMPLETE: {
      console.log('UPDATE OCPPMLEETE!!')
      // send another update in POLLING_INTERVAL milliseconds
      return pollingLoop(state)
    }
    case MARK_AUTODROP_JOB_AS_DONE: {
      const {
        autodropJobID,
      } = state

      if (autodropJobID == null) {
        throw new Error('AutoDrop Job ID cannot be Null')
      }

      console.log('MARK AS DONE!!!')

      const nextState = state.set('autodropJobState', DONE)

      return loop(
        nextState,
        runFetchCmd({
          state,
          params: {
            jobID: autodropJobID,
            stat: 'Done',
          },
          successActionCreator: autodropJobDone,
        }),
      )
    }
    case AUTODROP_JOB_DONE: {
      return resetState(state)
        .set('printerIsIdle', state.printerIsIdle)
    }
    case FETCH_FAIL: {
      // the fetch either failed while downloading the next job or
      // failed while marking the previous job as complete
      let retryActionCreator = null
      switch (state.autodropJobState) {
        case IDLE: {
          retryActionCreator = pollAutodrop
          break
        }
        case PRINTING: {
          retryActionCreator = pollAutodrop
          break
        }
        case DONE: {
          retryActionCreator = markAutodropJobAsDone
          break
        }
        default: {
          throw new Error(
            `Invalid Autodrop Job State: ${state.state.autodropJobState}`,
          )
        }
      }

      return loop(
        state,
        Cmd.run(Promise.delay, {
          args: [RETRY_DELAY_AFTER_ERROR],
          successActionCreator: retryActionCreator,
        }),
      )
    }
    default: {
      return state
    }
  }
}

export default autodropReducer
