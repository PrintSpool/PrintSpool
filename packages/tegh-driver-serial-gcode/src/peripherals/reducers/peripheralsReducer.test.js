import { Record, Map } from 'immutable'

import {
  ESTOP,
  DRIVER_ERROR,
  PRINTER_DISCONNECTED,
  SET_CONFIG,
  PeripheralTypeEnum,
} from 'tegh-core'

import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import { SERIAL_SEND } from '../../serial/actions/serialSend'

import { createTestConfig } from '../../config/types/Settings'

import reducer, { initialState, Heater, Fan } from './peripheralsReducer'

const {
  EXTRUDER,
  HEATED_BED,
  FAN,
} = PeripheralTypeEnum

describe('peripheralsReducer', () => {
  const initializingActions = [
    SET_CONFIG,
    ESTOP,
    DRIVER_ERROR,
    PRINTER_DISCONNECTED,
  ]
  initializingActions.forEach((actionType) => {
    describe(actionType, () => {
      it('initializes each peripheral\'s state', () => {
        const peripheralTypes = {
          e0: EXTRUDER,
          e1: EXTRUDER,
          b: HEATED_BED,
          f0: FAN,
          f1: FAN,
        }
        const config = createTestConfig().setIn(
          ['machine', 'peripherals'],
          Object.entries(peripheralTypes).map(([id, type]) => (
            Record({ id, type })()
          )),
        )
        const state = initialState
        const action = { type: actionType, config }

        const nextState = reducer(state, action)

        expect(nextState.toJSON()).toEqual(
          initialState
            .set('heaters', Map({
              e0: Heater({ id: 'e0' }),
              e1: Heater({ id: 'e1' }),
              b: Heater({ id: 'b' }),
            }))
            .set('fans', Map({
              f0: Fan({ id: 'f0' }),
              f1: Fan({ id: 'f1' }),
            }))
            .toJSON(),
        )
      })
    })
  })
})
