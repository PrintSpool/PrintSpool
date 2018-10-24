import { MockJob } from '../types/Job'
import { MockJobFile } from '../types/JobFile'
import { MockTask } from '../../spool/types/Task'
import JobHistoryEvent from '../types/JobHistoryEvent'
import {
  START_PRINT,
  SPOOL_PRINT,
  CANCEL_PRINT,
  PRINT_ERROR,
  FINISH_PRINT,
} from '../types/JobHistoryTypeEnum'

import unlinkTmpFiles from '../sideEffects/unlinkTmpFiles'

import jobQueueReducer, { initialState } from './jobQueueReducer'

import { CREATE_JOB } from '../actions/createJob'
import deleteJob, { DELETE_JOB } from '../actions/deleteJob'

import spoolTask, { SPOOL_TASK } from '../../spool/actions/spoolTask'
import despoolTask, { DESPOOL_TASK } from '../../spool/actions/despoolTask'
import cancelTask, { CANCEL_TASK } from '../../spool/actions/cancelTask'

import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'

describe('jobQueueReducer', () => {
  describe(CREATE_JOB, () => {
    it('adds the job and job files', () => {
      const jobFile = MockJobFile()
      const job = MockJob()
      const action = {
        type: CREATE_JOB,
        payload: {
          job,
          jobFiles: { [jobFile.id]: jobFile },
        },
      }

      const nextState = jobQueueReducer(initialState, action)

      expect(nextState.jobs.get(job.id)).toEqual(job)
      expect(nextState.jobFiles.get(jobFile.id)).toEqual(jobFile)
    })
  })

  describe(DELETE_JOB, () => {
    it('removes the job, job files, history and deletes the tmp files', () => {
      const job = MockJob()
      const jobFile = MockJobFile({
        jobID: job.id,
        filePath: '/lol/wut',
      })
      const historyEvent = JobHistoryEvent({
        jobID: job.id,
        jobFileID: jobFile.id,
        type: START_PRINT,
      })
      const state = initialState
        .setIn(['jobs', job.id], job)
        .setIn(['jobFiles', jobFile.id], jobFile)
        .setIn(['history', 0], historyEvent)
      const action = deleteJob({ jobID: job.id })

      const [
        nextState,
        sideEffect,
      ] = jobQueueReducer(state, action)

      expect(nextState.jobs.toJS()).toEqual({})
      expect(nextState.jobFiles.toJS()).toEqual({})
      expect(sideEffect.func).toEqual(unlinkTmpFiles)
      expect(sideEffect.args).toEqual([['/lol/wut']])
    })
  })

  const errorsAndCancellations = [
    { actionType: ESTOP, eventType: CANCEL_PRINT },
    { actionType: PRINTER_READY, eventType: PRINT_ERROR },
    { actionType: DRIVER_ERROR, eventType: PRINT_ERROR },
  ]
  errorsAndCancellations.forEach(({ actionType, eventType }) => {
    describe(actionType, () => {
      it('adds the event to the history', () => {
        const job = MockJob()
        const jobFile = MockJobFile({
          jobID: job.id,
        })
        const taskID = 'some_task_id'
        const spoolEvent = JobHistoryEvent({
          jobID: job.id,
          jobFileID: jobFile.id,
          taskID,
          type: SPOOL_PRINT,
        })
        const state = initialState
          .setIn(['jobs', job.id], job)
          .setIn(['jobFiles', jobFile.id], jobFile)
          .setIn(['history', 0], spoolEvent)
        const action = { type: actionType }

        const nextState = jobQueueReducer(state, action)
        const secondEvent = nextState.history.get(1)

        expect(nextState.history.size).toEqual(2)
        expect(secondEvent.type).toEqual(eventType)
        expect(secondEvent.jobID).toEqual(job.id)
        expect(secondEvent.jobFileID).toEqual(jobFile.id)
        expect(secondEvent.taskID).toEqual(taskID)
      })
    })
  })

  describe(CANCEL_TASK, () => {
    it('does nothing if the task does not belong to a job', () => {
      const action = cancelTask({ taskID: 'test_test_test' })

      const nextState = jobQueueReducer(initialState, action)

      expect(nextState).toEqual(initialState)
    })
    it('adds the event to the history if the task belongs to a job', () => {
      const job = MockJob()
      const jobFile = MockJobFile({
        jobID: job.id,
      })
      const spoolEvent = JobHistoryEvent({
        jobID: job.id,
        jobFileID: jobFile.id,
        taskID: 'job_task',
        type: SPOOL_PRINT,
      })

      const action = cancelTask({ taskID: 'job_task' })

      const state = initialState
        .setIn(['jobs', job.id], job)
        .setIn(['jobFiles', jobFile.id], jobFile)
        .setIn(['history', 0], spoolEvent)

      const nextState = jobQueueReducer(state, action)
      const secondEvent = nextState.history.last()

      expect(nextState.history.size).toEqual(2)
      expect(secondEvent.jobID).toEqual(job.id)
      expect(secondEvent.jobFileID).toEqual(jobFile.id)
      expect(secondEvent.taskID).toEqual('job_task')
      expect(secondEvent.type).toEqual(CANCEL_PRINT)
    })
  })

  describe(SPOOL_TASK, () => {
    it('does nothing if the task does not belong to a job', () => {
      const action = spoolTask(MockTask())

      const nextState = jobQueueReducer(initialState, action)

      expect(nextState).toEqual(initialState)
    })

    it('deletes the previously completed job if the task belongs to a job', () => {
      const finishedJob = MockJob({
        id: 'finished_job',
      })
      const finishedJobFile = MockJobFile({
        jobID: finishedJob.id,
      })
      const finishEvent = JobHistoryEvent({
        jobID: finishedJob.id,
        jobFileID: finishedJobFile.id,
        taskID: 'job_task',
        type: FINISH_PRINT,
      })

      const spooledJob = MockJob()
      const spooledJobFile = MockJobFile({
        jobID: spooledJob.id,
      })
      const spooledTask = MockTask({
        jobID: spooledJob.id,
        jobFileID: spooledJobFile.id,
      })

      const action = spoolTask(spooledTask)

      const state = initialState
        .setIn(['jobs', spooledJob.id], spooledJob)
        .setIn(['jobFiles', spooledJobFile.id], spooledJobFile)
        .setIn(['jobs', finishedJob.id], finishedJob)
        .setIn(['jobFiles', finishedJobFile.id], finishedJobFile)
        .setIn(['history', 0], finishEvent)

      const [
        nextState,
        { actionToDispatch: nextAction },
      ] = jobQueueReducer(state, action)

      const spoolEvent = nextState.history.last()

      expect(nextAction).toEqual(deleteJob({ jobID: finishedJob.id }))
      expect(nextState.history.size).toEqual(2)
      expect(spoolEvent.jobID).toEqual(spooledJob.id)
      expect(spoolEvent.jobFileID).toEqual(spooledJobFile.id)
      expect(spoolEvent.taskID).toEqual(spooledTask.id)
      expect(spoolEvent.type).toEqual(SPOOL_PRINT)
    })
  })

  describe(DESPOOL_TASK, () => {
    it('does nothing if the task does not belong to a job', () => {
      const action = despoolTask(MockTask())

      const nextState = jobQueueReducer(initialState, action)

      expect(nextState).toEqual(initialState)
    })
    describe('if the task belongs to a job', () => {
      const job = MockJob()
      const jobFile = MockJobFile({
        jobID: job.id,
      })
      const state = initialState
        .setIn(['jobs', job.id], job)
        .setIn(['jobFiles', jobFile.id], jobFile)

      it('records a START_PRINT event if the print is starting', () => {
        const task = MockTask({
          jobID: job.id,
          jobFileID: jobFile.id,
          currentLineNumber: 0,
        })
        const action = despoolTask(task)

        const nextState = jobQueueReducer(state, action)
        const startEvent = nextState.history.last()

        expect(nextState.history.size).toEqual(1)
        expect(startEvent.jobID).toEqual(job.id)
        expect(startEvent.jobFileID).toEqual(jobFile.id)
        expect(startEvent.taskID).toEqual(task.id)
        expect(startEvent.type).toEqual(START_PRINT)
      })
      it('records a FINISH_PRINT event if the print is finishing', () => {
        const task = MockTask({
          jobID: job.id,
          jobFileID: jobFile.id,
          currentLineNumber: 1,
        })
        const action = despoolTask(task)

        const nextState = jobQueueReducer(state, action)
        const finishEvent = nextState.history.last()

        expect(nextState.history.size).toEqual(1)
        expect(finishEvent.jobID).toEqual(job.id)
        expect(finishEvent.jobFileID).toEqual(jobFile.id)
        expect(finishEvent.taskID).toEqual(task.id)
        expect(finishEvent.type).toEqual(FINISH_PRINT)
      })
      it('records START_PRINT and FINISH_PRINT if the print is 1 line long', () => {
        const task = MockTask({
          jobID: job.id,
          jobFileID: jobFile.id,
          currentLineNumber: 0,
          data: ['g1 x10 f3000'],
        })
        const action = despoolTask(task)

        const nextState = jobQueueReducer(state, action)
        const startEvent = nextState.history.first()
        const finishEvent = nextState.history.last()

        expect(nextState.history.size).toEqual(2)
        expect(startEvent.type).toEqual(START_PRINT)
        expect(finishEvent.type).toEqual(FINISH_PRINT)
      })
    })
  })
})
