// import spoolReducer, { initialState } from './spoolReducer'

/* printer actions */
import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'
/* job actions */
import { CREATE_JOB } from '../../jobQueue/actions/createJob'
import { CANCEL_JOB } from '../../jobQueue/actions/cancelJob'
import { DELETE_JOB } from '../../jobQueue/actions/deleteJob'
/* task actions */
import { SPOOL_TASK } from '../actions/spoolTask'
import { DESPOOL_TASK } from '../actions/despoolTask'

let taskReducer, spoolReducer, initialState

describe('spoolReducer', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.doMock('./taskReducer', () => {
      return jest.fn((state, action) => [state, action])
    })
    const m = require('./spoolReducer')
    spoolReducer = m.default
    initialState = m.initialState
  })

  afterEach(() => {
    jest.unmock('./taskReducer')
  })

  const spoolResetActions = [
    PRINTER_READY,
    ESTOP,
    DRIVER_ERROR,
  ]

  spoolResetActions.forEach(type => {
    describe(type, () => {
      it('resets the priority queues', () => {
        const state = initialState.set('priorityQueues', 'VALUE BEFORE RESET')
        const action = { type }

        const result = spoolReducer(state, action)

        expect(result.priorityQueues).toEqual(initialState.priorityQueues)
      })
    })
  })

  const passThroughActions = [
    ...spoolResetActions,
    CANCEL_JOB,
  ]

  passThroughActions.forEach(type => {
    describe(type, () => {
      it('passes through the action', () => {
        const state = initialState.mergeIn(['tasks'], {
          a: 'A',
          b: 'B',
          c: 'C',
        })
        const action = { type }

        const result = spoolReducer(state, action)

        expect(result.tasks.toJS()).toEqual({
          a: ['A', action],
          b: ['B', action],
          c: ['C', action],
        })
      })
    })
  })

  describe(SPOOL_TASK, () => {

  })
  //
  // describe(DESPOOL_TASK, () => {
  //
  // })
})
