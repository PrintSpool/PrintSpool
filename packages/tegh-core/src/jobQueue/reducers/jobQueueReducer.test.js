import { MockJob } from '../types/Job'
import { MockTask } from '../../spool/types/Task'

import reducer, { initialState } from './jobQueueReducer'

import createJob, { CREATE_JOB } from '../actions/createJob'
import deleteJob, { DELETE_JOB } from '../actions/deleteJob'

import { SPOOL_TASK } from '../../spool/actions/spoolTask'
import { DESPOOL_TASK } from '../../spool/actions/despoolTask'
import { CANCEL_TASK } from '../../spool/actions/cancelTask'

import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'

describe('jobQueueReducer', () => {
  describe(CREATE_JOB, () => {
    it('adds the job and job files', () => {

    })
  })
  describe(DELETE_JOB, () => {
    it('removes the job and job files and deletes the tmp files', () => {

    })
  })

  const errorsAndCancellations = [
    PRINTER_READY,
    ESTOP,
    DRIVER_ERROR,
  ]
  errorsAndCancellations.forEach(type => {
    describe(type, () => {
      it('adds the event to the history', () => {

      })
    })
  })

  describe(CANCEL_TASK, () => {
    it('does nothing if the task does not belong to a job', () => {

    })
    it('adds the event to the history if the task belongs to a job', () => {

    })
  })
  describe(SPOOL_TASK, () => {
    it('does nothing if the task does not belong to a job', () => {

    })
    it('deletes the previously completed job if the task belongs to a job', () => {

    })
  })
  describe(DESPOOL_TASK, () => {
    it('does nothing if the task does not belong to a job', () => {

    })
    describe('if the task belongs to a job', () => {
      it('records a START_PRINT event if the print is starting', () => {

      })
      it('records a FINISH_PRINT event if the print is finishing', () => {

      })
    })
  })

  describe(SPOOL_TASK, () => {
    it('deletes the previous job and it\'s tmp files', async () => {
      const previousJob = MockJob({ status: DONE })
      const previousJobFile = MockJobFile({ jobID: previousJob.id })
      const nextJob = MockJob()
      const nextJobFile = MockJobFile({ jobID: nextJob.id })

      const state = initialState.merge({
        jobs: {
          [previousJob.id]: previousJob,
          [nextJob.id]: nextJob,
        },
        jobFiles: {
          [previousJobFile.id]: previousJobFile,
          [nextJobFile.id]: nextJobFile,
        },
      })

      const task = mockTask({
        jobID: nextJob.id,
        jobFileID: 'next_job_file_id',
      })
      const action = spoolTask(task)

      /* a promise that waits for a change to the tmp file */
      let tmpFileDidChange = false
      const tmpFileChangePromise = new Promise((resolve) => {
        const watcher = fs.watch(tmpFile, { persistent: false }, () => {
          watcher.close()
          resolve()
          tmpFileDidChange = true
        })
      })

      const sagaTester = createTester()
      sagaTester.dispatch(action)

      if (tmpFileDidChange === false) {
        await tmpFileChangePromise
      }

      const result = sagaTester.getCalledActions()

      expect(fs.existsSync(tmpFile)).toEqual(false)

      expect(result).toMatchObject([
        action,
        {
          type: DELETE_JOB,
          payload: { jobID: 'mock_job' },
        },
      ])
    })
})
