import Promise from 'bluebird'
import { Cmd, getModel, getCmd } from 'redux-loop'
import MockDate from 'mockdate'

import {
  uuid,
  requestCreateJob,
} from '@tegh/core'

import fetchFromAutodrop from '../sideEffects/fetchFromAutodrop'

import requestAutodropJob from '../actions/requestAutodropJob'
import fetchFail from '../actions/fetchFail'
import fetchComplete, { FETCH_COMPLETE } from '../actions/fetchComplete'
import markAutodropJobAsDone, { MARK_AUTODROP_JOB_AS_DONE } from '../actions/markAutodropJobAsDone'
import autodropJobDone from '../actions/autodropJobDone'

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
  describe(MARK_AUTODROP_JOB_AS_DONE, () => {
    it('marks the job as done', () => {
      const action = markAutodropJobAsDone()
      const state = initialState
        .set('autodropJobID', '95')
        .set('apiURL', 'test.com')

      const results = autodropReducer(state, action)

      expect(getModel(results)).toEqual(state)
      expect(getCmd(results)).toEqual(
        Cmd.run(fetchFromAutodrop, {
          args: [{ url: 'test.com?name=null&key=null&jobID=95&stat=Done' }],
          successActionCreator: autodropJobDone,
          failActionCreator: fetchFail,
        }),
      )
    })
  })
})
