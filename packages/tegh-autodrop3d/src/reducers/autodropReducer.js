import { loop, Cmd } from 'redux-loop'
import { Record, Set } from 'immutable'
import fetch from 'node-fetch'

import {
  SET_CONFIG,
  PRINTER_READY,
  DESPOOL_TASK,
  requestDespool,
  getPluginModels,
  isMacroEnabled,
} from '@tegh/core'

import requestFetch, { REQUEST_FETCH } from '../actions/requestFetch'
import fetchComplete, { FETCH_COMPLETE } from '../actions/fetchComplete'

const initialState = Record({
  deviceID: null,
  apiUrl: null,
  outputPins: Set(),
})()

const PACKAGE = '@tegh/autodrop3d'

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
      const { deviceID, apiUrl } = getPluginModels(config).get(PACKAGE).toJS()

      const nextState = initialState.merge({
        deviceID,
        apiUrl: apiUrl || DEFAULT_URL,
      })
      // todo
      return nextState
    }
    case PRINTER_READY: {
      return loop(
        state,
        Cmd.action(requestFetch()),
      )
    }
    case REQUEST_FETCH: {
      const { deviceID, apiUrl } = state
      const SliceOnPrinter = 'RED'

      const url = `${apiUrl}?name=${deviceID}&NoGcode=${SliceOnPrinter}`
      console.log(url)
      return loop(
        state,
        Cmd.run(
          () => fetch(url).then(res => res.text()),
          {
            successActionCreator: fetchComplete,
          },
        ),
      )
    }
    case FETCH_COMPLETE: {
      const lines = action.payload.split('\n')
      // const isError = lines[0].indexOf('{') !== -1
      //
      // if (isError) {
      //   // TODO
      // }

      const queueIsEmpty = lines[0].indexOf(';START') === -1
      const jobID = lines[2].replace(';', '').strip()

      if (queueIsEmpty) {
        console.log(queueIsEmpty)
        // TODO
        return state
      }
      console.log({ jobID })
      console.log(lines.slice(0, 50))
      // const nextAction = createJob({
      //   // TODO
      // })
      //
      // return loop(
      //   state,
      //   nextAction,
      // )
    }
    default: {
      return state
    }
  }
}

export default autodropReducer
