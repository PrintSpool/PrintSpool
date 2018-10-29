import { List } from 'immutable'
import Promise from 'bluebird'
import { Cmd } from 'redux-loop'

import {
  PRINTER_READY,
  printerReady,
  SET_CONFIG,
  SPOOL_TASK,
  setConfig,
  PriorityEnum,
} from 'tegh-core'

import reducer, { initialState } from './pollTemperatureReducer'

import rxParser from '../../rxParser'
import serialReceive, { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import { createTestConfig } from '../../config/types/Settings'

import requestTemperatureQuery, { REQUEST_TEMPERATURE_QUERY } from '../actions/requestTemperatureQuery'

const { PREEMPTIVE } = PriorityEnum

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

      expect(nextAction).toEqual(requestTemperatureQuery())
    })
  })

  describe(SERIAL_RECEIVE, () => {
    it('receives temperature data and waits to send next poll', () => {
      const action = serialReceive({ data: 'ok t:10', receiveParser: rxParser })

      const sideEffect = reducer(stateAfterConfig, action)[1]

      expect(sideEffect).toEqual(
        Cmd.run(Promise.delay, {
          args: [temperaturePollingInterval],
          successActionCreator: requestTemperatureQuery,
        }),
      )
    })

    it('does not poll if it does not receive temperature data', () => {
      const action = serialReceive({ data: 'ok', receiveParser: rxParser })

      const nextState = reducer(stateAfterConfig, action)

      expect(nextState).toEqual(stateAfterConfig)
    })
  })

  describe(REQUEST_TEMPERATURE_QUERY, () => {
    describe('when the printer is not ready', () => {
      it('does nothing', () => {
        const action = requestTemperatureQuery()
        const state = stateAfterConfig.set('isReady', false)

        const nextState = reducer(state, action)

        expect(nextState).toEqual(state)
      })
    })

    describe('when the printer is ready', () => {
      it('spools an M105 in order to query the temperature', () => {
        const action = requestTemperatureQuery()
        const state = stateAfterConfig.set('isReady', true)

        const [
          nextState,
          { actionToDispatch: nextAction },
        ] = reducer(state, action)

        expect(nextState).toEqual(state)
        expect(nextAction.type).toEqual(SPOOL_TASK)
        expect(nextAction.payload.task.priority).toEqual(PREEMPTIVE)
        expect(nextAction.payload.task.data.toJS()).toEqual(['M105'])
      })
    })
  })
})
