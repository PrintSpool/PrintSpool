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
} from '@tegh/core'

import requestAutodropJob, { REQUEST_AUTODROP_JOB } from '../actions/requestAutodropJob'
import markAutodropJobAsDone, { MARK_AUTODROP_JOB_AS_DONE } from '../actions/markAutodropJobAsDone'
import fetchComplete, { FETCH_COMPLETE } from '../actions/fetchComplete'
import fetchFail, { FETCH_FAIL } from '../actions/fetchFail'
import autodropJobDone, { AUTODROP_JOB_DONE } from '../actions/autodropJobDone'

import fetchFromAutodrop from '../sideEffects/fetchFromAutodrop'

export const initialState = Record({
  printing: false,
  autodropJobID: null,
  deviceID: null,
  deviceKey: null,
  apiURL: null,
})()

const PACKAGE = '@tegh/autodrop3d'
const RETRY_DELAY_AFTER_ERROR = 3000
const POLLING_INTERVAL = 500

const DEFAULT_URL = (
  'https://autodrop.sparkhosted.site/api/jobsQueue/printerRequestJob'
)

const autodropReducer = (state, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const { deviceID, apiURL } = getPluginModels(config).get(PACKAGE).toJS()

      const nextState = initialState.merge({
        deviceID,
        apiURL: apiURL || DEFAULT_URL,
      })
      // todo
      return nextState
    }
    case PRINTER_READY: {
      const nextState = state.set('printing', false)

      return loop(
        nextState,
        Cmd.action(requestAutodropJob()),
      )
    }
    case DESPOOL_TASK: {
      if (action.payload.task.jobID == null) {
        return state
      }

      return state.set('printing', true)
    }
    case JOB_QUEUE_COMPLETE: {
      const { autodropJobID } = state

      const nextState = state.set('printing', false)

      const nextAction = (
        autodropJobID == null ? requestAutodropJob() : markAutodropJobAsDone()
      )

      return loop(
        nextState,
        Cmd.action(nextAction),
      )
    }
    case REQUEST_AUTODROP_JOB: {
      const {
        deviceID,
        deviceKey,
        apiURL,
        printing,
      } = state

      // do not download any jobs from AutoDrop until the printer is idle
      if (printing) {
        return state
      }

      const url = `${apiURL}?name=${deviceID}&key=${deviceKey}`

      const nextState = state.set('autodropJobID', null)

      return loop(
        nextState,
        Cmd.run(
          fetchFromAutodrop,
          {
            args: [{ url }],
            successActionCreator: fetchComplete,
            failActionCreator: fetchFail,
          },
        ),
      )
    }
    case FETCH_COMPLETE: {
      const content = action.payload
      const lines = content.split('\n')

      console.log(lines.slice(0, 50))
      const autodropIsEmpty = lines[0].indexOf(';START') === -1

      if (autodropIsEmpty) {
        // start polling
        return loop(
          state,
          Cmd.run(Promise.delay, {
            args: [POLLING_INTERVAL],
            successActionCreator: requestAutodropJob,
          }),
        )
      }

      const autodropJobID = lines[2].replace(';', '').trim()

      console.log({ autodropJobID })

      const nextState = state.merge({ autodropJobID })

      const name = `AUTODROP JOB #${autodropJobID}`

      const nextAction = requestCreateJob({
        name,
        files: [{
          name,
          content,
        }],
      })

      return loop(
        nextState,
        Cmd.action(nextAction),
      )
    }
    case MARK_AUTODROP_JOB_AS_DONE: {
      const {
        apiURL,
        autodropJobID,
        deviceID,
        deviceKey,
      } = state

      if (autodropJobID == null) {
        throw new Error('AutoDrop Job ID cannot be Null')
      }

      const url = (
        `${apiURL}?name=${deviceID}&key=${deviceKey}&jobID=${autodropJobID}&stat=Done`
      )

      console.log('MARK AS DONE!!!', url)

      return loop(
        state,
        Cmd.run(
          fetchFromAutodrop,
          {
            args: [{ url }],
            successActionCreator: autodropJobDone,
            failActionCreator: fetchFail,
          },
        ),
      )
    }
    case AUTODROP_JOB_DONE: {
      const nextState = state.set('autodropJobID', null)

      return loop(
        nextState,
        Cmd.action(requestAutodropJob()),
      )
    }
    case FETCH_FAIL: {
      // the fetch either failed while downloading the next job or
      // failed while marking the previous job as complete
      const retryActionCreator = (
        state.autodropJobID == null ? requestAutodropJob : markAutodropJobAsDone
      )

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
