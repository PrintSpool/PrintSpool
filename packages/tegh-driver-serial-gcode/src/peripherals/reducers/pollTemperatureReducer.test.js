import { List } from 'immutable'
import Promise from 'bluebird'
import { Cmd } from 'redux-loop'

import {
  PRINTER_READY,
  printerReady,
  SET_CONFIG,
  setConfig,
} from 'tegh-core'

import reducer, { initialState } from './pollTemperatureReducer'

import rxParser from '../../rxParser'
import serialReceive, { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import { createTestConfig } from '../../config/types/Settings'

import spoolTemperatureQuery from '../actions/spoolTemperatureQuery'

const temperaturePollingInterval = 1337

const config = createTestConfig({
  temperaturePollingInterval,
})

const stateAfterConfig = initialState
  .set('pollingInterval', temperaturePollingInterval)

describe('pollTemperatureReducer', () => {
  describe(SET_CONFIG, () => {
    it('configures pollings', () => {
      const action = setConfig({ config, plugins: List() })

      const nextState = reducer(initialState, action)

      expect(nextState).toEqual(stateAfterConfig)
    })
  })

  describe(PRINTER_READY, () => {
    it('queries temperature immediately', () => {
      const action = printerReady()

      const {
        actionToDispatch: nextAction,
      } = reducer(stateAfterConfig, action)[1]

      expect(nextAction.type).toEqual(spoolTemperatureQuery().type)
      expect(nextAction.payload.task.data).toEqual(
        spoolTemperatureQuery().payload.task.data,
      )
    })
  })

  describe(SERIAL_RECEIVE, () => {
    it('receives temperature data and waits to send next poll', () => {
      const action = serialReceive({ data: 'ok t:10', receiveParser: rxParser })

      const sideEffect = reducer(stateAfterConfig, action)[1]

      expect(sideEffect).toEqual(
        Cmd.run(Promise.delay, {
          args: [temperaturePollingInterval],
          successActionCreator: spoolTemperatureQuery,
        }),
      )
    })

    it('does not poll if it does not receive temperature data', () => {
      const action = serialReceive({ data: 'ok', receiveParser: rxParser })

      const nextState = reducer(stateAfterConfig, action)

      expect(nextState).toEqual(stateAfterConfig)
    })
  })
})
