import Promise from 'bluebird'
import { Cmd, getModel, getCmd } from 'redux-loop'
import MockDate from 'mockdate'

import {
  uuid,
  requestCreateJob,
} from '@tegh/core'

import requestAutodropJob from '../actions/requestAutodropJob'
import fetchComplete, { FETCH_COMPLETE } from '../actions/fetchComplete'

import autodropReducer, { initialState } from './autodropReducer'

describe(autodropReducer, () => {
  afterEach(() => {
    MockDate.reset()
  })

  describe(FETCH_COMPLETE, () => {
    describe('when a job is returned', () => {
      it('creates a job and sets the autodropJobID', () => {
        const content = [
          ';START ',
          ';PRINT ID ',
          ';99 ',
          ';3 ',
        ].join('\n')
        const name = 'AUTODROP JOB #99'

        MockDate.set('1/1/2000')
        jest.spyOn(uuid, 'v4').mockReturnValue('MOCK_ID')

        const action = fetchComplete(content)

        const results = autodropReducer(initialState, action)

        expect(getModel(results)).toEqual(
          initialState.set('autodropJobID', '99'),
        )
        expect(getCmd(results).actionToDispatch).toEqual(
          requestCreateJob({
            name,
            files: [{
              name,
              content,
            }],
          }),
        )
      })
    })

    describe('when the queue is empty', () => {
      it('checks again in 500ms', () => {
        const content = 'No Print FOr you'

        const action = fetchComplete(content)

        const results = autodropReducer(initialState, action)

        expect(getModel(results)).toEqual(initialState)
        expect(getCmd(results)).toEqual(
          Cmd.run(Promise.delay, {
            args: [500],
            successActionCreator: requestAutodropJob,
          }),
        )
      })
    })
  })
})
