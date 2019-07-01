import { Cmd, getModel, getCmd } from 'redux-loop'
import MockDate from 'mockdate'

import {
  despoolCompleted,
  despoolTask,
  DESPOOL_TASK,
  MockTask,
} from '@tegapp/core'

import downloadAutodropJob from '../actions/downloadAutodropJob'
import pollAutodrop, { POLL_AUTODROP } from '../actions/pollAutodrop'
import jobDownloadComplete, { JOB_DOWNLOAD_COMPLETE } from '../actions/jobDownloadComplete'

import autodropJobDownloadReducer, { initialState, runPollAfterInterval } from './autodropJobDownloadReducer'

describe(autodropJobDownloadReducer, () => {
  afterEach(() => {
    MockDate.reset()
  })

  describe(DESPOOL_TASK, () => {
    describe('fetchAutodropJob', () => {
      it('downloads the next job', () => {
        const action = despoolTask(
          MockTask({
            data: ['fetchAutodropJob'],
            currentLineNumber: 0,
          }),
        )

        const results = autodropJobDownloadReducer(initialState, action)

        expect(getCmd(results)).toEqual(Cmd.action(downloadAutodropJob()))

        const nextState = getModel(results)
        expect(nextState).toEqual(
          initialState.merge({
            downloadingJob: true,
            blocking: true,
          }),
        )
      })
    })
  })
  describe(POLL_AUTODROP, () => {
    describe('when a job is already downloading', () => {
      it('does a noop', () => {
        const action = pollAutodrop()

        const state = initialState
          .set('config', { automaticJobDownload: true })
          .set('downloadingJob', true)

        const results = autodropJobDownloadReducer(state, action)

        expect(getCmd(results)).toEqual(null)
        expect(getModel(results)).toEqual(state)
      })
    })
    describe('when the queue is not empty', () => {
      it('continues polling', () => {
        const action = pollAutodrop()

        const state = initialState
          .set('config', { automaticJobDownload: true })
          .set('queueIsEmpty', false)

        const results = autodropJobDownloadReducer(state, action)

        expect(getCmd(results)).toEqual(runPollAfterInterval())
        expect(getModel(results)).toEqual(state)
      })
    })

    it('downloads the next job', () => {
      const action = pollAutodrop()

      const state = initialState
        .set('config', { automaticJobDownload: true })

      const results = autodropJobDownloadReducer(state, action)

      expect(getCmd(results)).toEqual(Cmd.action(downloadAutodropJob()))
      expect(getModel(results)).toEqual(
        state.merge({
          downloadingJob: true,
        }),
      )
    })
  })
  describe(JOB_DOWNLOAD_COMPLETE, () => {
    describe('when a blocking GCode is awaiting the download', () => {
      it('completes the despool', () => {
        const action = jobDownloadComplete()

        const state = initialState.merge({
          downloadingJob: true,
          blocking: true,
          despoolingTask: 'my_task'
        })

        const results = autodropJobDownloadReducer(state, action)

        expect(getCmd(results)).toEqual(Cmd.list([
          runPollAfterInterval(),
          Cmd.action(despoolCompleted({ task: 'my_task' })),
        ]))
        expect(getModel(results)).toEqual(
          state.merge({
            downloadingJob: false,
            blocking: false,
            despoolingTask: null,
          }),
        )
      })
    })

    it('marks the download complete and continues polling', () => {
      const action = jobDownloadComplete()

      const state = initialState.merge({
        downloadingJob: true,
      })

      const results = autodropJobDownloadReducer(state, action)

      expect(getCmd(results)).toEqual(Cmd.list([
        runPollAfterInterval(),
      ]))
      expect(getModel(results)).toEqual(
        state.merge({
          downloadingJob: false,
        }),
      )
    })
  })
})
