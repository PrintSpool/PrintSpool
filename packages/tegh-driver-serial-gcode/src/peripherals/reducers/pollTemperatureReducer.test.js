import Promise from 'bluebird'
import { Cmd } from 'redux-loop'

import {
  printerReady,
} from 'tegh-core'

import reducer, { initialState } from './pollTemperatureReducer'

import rxParser from '../../rxParser'
import serialReceive from '../../serial/actions/serialReceive'
import { createTestConfig } from '../../config/types/Settings'

import spoolTemperatureQuery from '../actions/spoolTemperatureQuery'

const temperaturePollingInterval = 1337

const config = createTestConfig({
  temperaturePollingInterval,
})

describe('pollTemperatureReducer', () => {
  it('on receiving PRINTER_READY queries temperature immediately', () => {
    const action = { ...printerReady(), config }

    const {
      actionToDispatch: nextAction,
    } = reducer(initialState, action)[1]

    expect(nextAction.type).toEqual(spoolTemperatureQuery().type)
    expect(nextAction.payload.task.data).toEqual(
      spoolTemperatureQuery().payload.task.data,
    )
  })

  it('on receiving temperature data waits to send next poll', () => {
    const action = {
      ...serialReceive({ data: 'ok t:10', receiveParser: rxParser }),
      config,
    }

    const sideEffect = reducer(initialState, action)[1]

    expect(sideEffect).toEqual(
      Cmd.run(Promise.delay, {
        args: [temperaturePollingInterval],
        successActionCreator: spoolTemperatureQuery,
      }),
    )
  })

  it('does not poll if it does not receive temperature data', () => {
    const action = {
      ...serialReceive({ data: 'ok', receiveParser: rxParser }),
      config,
    }

    const nextState = reducer(initialState, action)

    expect(nextState).toEqual(initialState)
  })
})
