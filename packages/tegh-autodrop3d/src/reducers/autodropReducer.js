import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'
import { Record, Set } from 'immutable'

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

import fetchFromAutodrop from '../sideEffects/fetchFromAutodrop'

const initialState = Record({
  printing: false,
  autodropJobID: null,
  deviceID: null,
  apiURL: null,
  outputPins: Set(),
})()

const PACKAGE = '@tegh/autodrop3d'
const RETRY_DELAY_AFTER_ERROR = 3000
const POLLING_INTERVAL = 500

const DEFAULT_URL = (
  'https://autodrop.sparkhosted.site/api/jobsQueue/printerRequestJob'
)

/*
 * sets the value of a gpio output pin
 * args:
 *  pin: the pin number to set
 *  value: the on/off boolean value of the pin
 *
 * example use: setGPIO {"pin": 4, "value": true}
 */
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
    case MARK_AUTODROP_JOB_AS_DONE: {
      const { apiURL, autodropJobID } = state

      if (autodropJobID == null) {
        throw new Error('AutoDrop Job ID cannot be Null')
      }

      const url = `${apiURL}?jobID=${autodropJobID}&stat=Done`

      Cmd.run(
        fetchFromAutodrop,
        {
          args: [{ url }],
          successActionCreator: requestAutodropJob,
          failActionCreator: fetchFail,
        },
      )

      return loop(
        state,
        Cmd.action(requestAutodropJob()),
      )
    }
    case REQUEST_AUTODROP_JOB: {
      const { deviceID, apiURL, printing } = state

      // do not download any jobs from AutoDrop until the printer is idle
      if (printing) {
        return state
      }

      const url = `${apiURL}?name=${deviceID}`
      console.log(url)

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

      const autodropIsEmpty = lines[0].indexOf(';START') === -1
      const autodropJobID = lines[2].replace(';', '').strip()

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
      console.log({ autodropJobID })
      console.log(lines.slice(0, 50))

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
