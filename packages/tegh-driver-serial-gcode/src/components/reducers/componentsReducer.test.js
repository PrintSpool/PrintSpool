import { Map, List } from 'immutable'

import {
  ESTOP,
  DRIVER_ERROR,
  PRINTER_DISCONNECTED,
  SET_CONFIG,
  setConfig,
  ComponentTypeEnum,
  MockConfig,
} from 'tegh-core'

import serialReceive, { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend, { SERIAL_SEND } from '../../serial/actions/serialSend'

import rxParser from '../../rxParser'

import reducer, { initialState, Heater, Fan } from './componentsReducer'

const {
  TOOLHEAD,
  BUILD_PLATFORM,
  FAN,
} = ComponentTypeEnum

const config = MockConfig({
  printer: {
    components: [
      { address: 'e0', type: TOOLHEAD, heater: true },
      { address: 'e1', type: TOOLHEAD, heater: true },
      { address: 'b', type: BUILD_PLATFORM, heater: true },
      { address: 'f0', type: FAN },
      { address: 'f1', type: FAN },
    ].map(({ type, ...model }) => ({
      id: `${model.address}-ID`,
      type,
      model,
    })),
  },
})

const configuredState = initialState
  .set('byAddress', Map({
    e0: Heater({ id: 'e0-ID', type: TOOLHEAD, address: 'e0' }),
    e1: Heater({ id: 'e1-ID', type: TOOLHEAD, address: 'e1' }),
    b: Heater({ id: 'b-ID', type: BUILD_PLATFORM, address: 'b' }),
    f0: Fan({ id: 'f0-ID', type: FAN, address: 'f0' }),
    f1: Fan({ id: 'f1-ID', type: FAN, address: 'f1' }),
  }))

describe('componentsReducer', () => {
  describe(SET_CONFIG, () => {
    it('initializes each component\'s state', () => {
      const state = initialState
      const action = setConfig({ config, plugins: List([]) })

      const nextState = reducer(state, action)

      expect(nextState.toJS()).toEqual(configuredState.toJS())
    })
  })

  const stateResettingActions = [
    ESTOP,
    DRIVER_ERROR,
    PRINTER_DISCONNECTED,
  ]
  stateResettingActions.forEach((actionType) => {
    describe(actionType, () => {
      it('initializes each component\'s state', () => {
        const state = configuredState
          .setIn(['byAddress', 'e0', 'currentTemperature'], 120)
          .setIn(['byAddress', 'f0', 'enabled'], true)
        const action = { type: actionType }

        const nextState = reducer(state, action)

        expect(nextState.toJSON()).toEqual(configuredState.toJSON())
      })
    })
  })

  describe(SERIAL_RECEIVE, () => {
    it('sets the current temperatures and targetTemperaturesCountdown', () => {
      const temperature = 12
      const countdown = 32
      const action = {
        ...serialReceive({
          data: `ok t:${temperature} w:${countdown}`,
          receiveParser: rxParser,
        }),
        config,
      }

      const nextState = reducer(configuredState, action)

      expect(nextState.toJSON()).toEqual(
        configuredState
          .setIn(['byAddress', 'e0', 'currentTemperature'], temperature)
          .set('targetTemperaturesCountdown', countdown * 1000)
          .toJSON(),
      )
    })
  })

  describe(SERIAL_SEND, () => {
    it('merges the state changes from the action into the state', () => {
      const temperature = 42
      const action = {
        ...serialSend({
          macro: 'M109',
          args: { s: temperature },
          lineNumber: 3,
        }),
        config,
      }

      const nextState = reducer(configuredState, action)

      expect(nextState.toJSON()).toEqual(
        configuredState
          .setIn(['byAddress', 'e0', 'targetTemperature'], temperature)
          .setIn(['byAddress', 'e0', 'blocking'], true)
          .toJSON(),
      )
    })
  })
})
