import { Cmd, getModel, getCmd } from 'redux-loop'
import MockDate from 'mockdate'

import {
  uuid,
  requestCreateJob,
  MockTask,
  despoolTask,
  DESPOOL_TASK,
} from '@tegapp/core'

import fetchFromAutodrop from '../sideEffects/fetchFromAutodrop'

import jobDownloadComplete, { JOB_DOWNLOAD_COMPLETE } from '../actions/jobDownloadComplete'
import markAutodropJobAsDone, { MARK_AUTODROP_JOB_AS_DONE } from '../actions/markAutodropJobAsDone'
import autodropUpdateFail from '../actions/autodropUpdateFail'
import autodropJobDone from '../actions/autodropJobDone'
import autodropJobDoneFail from '../actions/autodropJobDoneFail'

import autodropJobStatusReducer, { initialState } from './autodropJobStatusReducer'

import { DEFAULT_URL } from '../selectors/getAutodropURL'

describe(autodropJobStatusReducer, () => {
  afterEach(() => {
    MockDate.reset()
  })

  describe(JOB_DOWNLOAD_COMPLETE, () => {
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

        const action = jobDownloadComplete(content)

        const results = autodropJobStatusReducer(initialState, action)

        expect(getModel(results)).toEqual(
          initialState.merge({
            autodropJobID: '99',
            teghJobID: 'MOCK_ID',
          }),
        )
        expect(getCmd(results)).toEqual(Cmd.list([
          Cmd.action(
            requestCreateJob({
              name,
              meta: { autodropJobID: '99' },
              files: [{
                name,
                content,
              }],
            }),
          ),
        ]))
      })
    })

    describe('when the queue is empty', () => {
      it('does a noop', () => {
        const content = 'No Print FOr you'

        const action = jobDownloadComplete(content)

        const results = autodropJobStatusReducer(initialState, action)

        expect(getModel(results)).toEqual(initialState)
        expect(getCmd(results)).toEqual(null)
      })
    })
  })
  describe(DESPOOL_TASK, () => {
    describe('after the update interval', () => {
      it('sends an update to Autodrop', () => {
        MockDate.set('1/1/2000')

        const action = despoolTask(
          MockTask({
            jobID: 'TEGH_99',
            data: ['G1 X10', 'G1 Y10', 'G1 Z10', 'G1 X-10'],
            currentLineNumber: 0,
          }),
        )
        const state = initialState.merge({
          autodropJobID: '99',
          teghJobID: 'TEGH_99',
          config: {
            deviceID: 'A',
            deviceKey: 'B',
          },
        })

        const results = autodropJobStatusReducer(state, action)

        const url = (
          `${DEFAULT_URL}?name=A&key=B&jobID=99&stat=update&jobStatus=25`
        )

        expect(getModel(results)).toEqual(
          state.merge({
            lastUpdate: Date.now(),
          }),
        )
        expect(getCmd(results)).toEqual(
          Cmd.run(fetchFromAutodrop, {
            args: [{
              url,
            }],
            failActionCreator: autodropUpdateFail,
          }),
        )
      })
    })
    describe('when it is the last line in the task', () => {
      it('marks the autodrop job as done', () => {
        const action = despoolTask(
          MockTask({
            jobID: 'TEGH_99',
            data: ['G1 X10', 'G1 Y10', 'G1 Z10', 'G1 X-10'],
            currentLineNumber: 3,
          }),
        )
        const state = initialState.merge({
          autodropJobID: '99',
          teghJobID: 'TEGH_99',
          config: {
            deviceID: 'A',
            deviceKey: 'B',
          },
        })

        const results = autodropJobStatusReducer(state, action)

        expect(getModel(results)).toEqual(state)
        expect(getCmd(results)).toEqual(
          Cmd.action(markAutodropJobAsDone()),
        )
      })
    })
  })
  describe(MARK_AUTODROP_JOB_AS_DONE, () => {
    it('marks the job as done', () => {
      const action = markAutodropJobAsDone()
      const state = initialState.merge({
        autodropJobID: '95',
        config: {
          deviceID: 'A',
          deviceKey: 'B',
        },
      })

      const results = autodropJobStatusReducer(state, action)

      expect(getModel(results)).toEqual(state)
      expect(getCmd(results)).toEqual(
        Cmd.run(fetchFromAutodrop, {
          args: [{
            url: `${DEFAULT_URL}?name=A&key=B&jobID=95&stat=Done`,
          }],
          successActionCreator: autodropJobDone,
          failActionCreator: autodropJobDoneFail,
        }),
      )
    })
  })
})
