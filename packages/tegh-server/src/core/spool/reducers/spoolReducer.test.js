import spoolReducer, { initialState } from './spoolReducer'
import taskReducer from './taskReducer'

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

jest.mock('./taskReducer')

describe('spoolReducer', () => {
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
    CREATE_JOB,
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

        spoolReducer(state, action)

        expect(dependency).toHaveBeenCalledTimes(3)
        expect(dependency).toHaveBeenCalledWith(state.tasks[1], action)
      })
    })
  })

  // describe(SPOOL_TASK, () => {
  //
  // })
  //
  // describe(DESPOOL_TASK, () => {
  //
  // })
})
