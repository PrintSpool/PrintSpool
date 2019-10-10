import { getModel } from 'redux-loop'
import { Set, List, Map } from 'immutable'

import { MockJob } from '../types/Job'
import { MockJobFile } from '../types/JobFile'
import { MockTask } from '../../jobQueue/types/Task'
import JobHistoryEvent from '../types/JobHistoryEvent'

import unlinkTmpFiles from '../sideEffects/unlinkTmpFiles'

import jobQueueReducer, { initialState } from './jobQueueReducer'

import { CREATE_JOB } from '../actions/createJob'
import deleteJob, { DELETE_JOB } from '../actions/deleteJob'

import spoolTask, { SPOOL_TASK } from '../../spool/actions/spoolTask'
import despoolTask, { DESPOOL_TASK } from '../../spool/actions/despoolTask'
import cancelTask, { CANCELLED } from '../../spool/actions/cancelTask'
import requestSpoolJobFile from '../../spool/actions/requestSpoolJobFile'

import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'

describe('jobQueueReducer', () => {
  describe(CREATE_JOB, () => {
    it('adds the job and job files', () => {
      const job = MockJob()
      const jobFile = MockJobFile({ jobID: job.id })
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
    describe('automatic printing', () => {
      it('starts the job if nothing else is queued', () => {
        const job = MockJob()
        const jobFile = MockJobFile({ jobID: job.id })
        const action = {
          type: CREATE_JOB,
          payload: {
            job,
            jobFiles: Map({ [jobFile.id]: jobFile }),
          },
        }

        const state = initialState
          .set('automaticPrinting', true)

        const [
          nextState,
          { actionToDispatch: nextAction },
        ] = jobQueueReducer(state, action)

        expect(nextState.jobs.get(job.id)).toEqual(job)
        expect(nextState.jobFiles.get(jobFile.id)).toEqual(jobFile)
        expect(nextAction).toEqual(
          requestSpoolJobFile({
            jobFileID: jobFile.id,
          }),
        )
      })
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

  describe(CANCELLED, () => {
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

      const results = jobQueueReducer(state, action)

      const nextState = getModel(results)

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
      const action = despoolTask(MockTask({ currentLineNumber: 0 }), Set())

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
        const action = despoolTask(task, Set())

        const results = jobQueueReducer(state, action)

        const nextState = getModel(results)

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
        const action = despoolTask(task, Set())

        const nextState = jobQueueReducer(state, action)
        const finishEvent = nextState.history.last()

        expect(nextState.history.size).toEqual(1)
        expect(finishEvent.jobID).toEqual(job.id)
        expect(finishEvent.jobFileID).toEqual(jobFile.id)
        expect(finishEvent.taskID).toEqual(task.id)
        expect(finishEvent.type).toEqual(FINISH_PRINT)
      })
      describe('automatic printing', () => {
        it('starts the next print if the print is finishing', () => {
          const task = MockTask({
            jobID: job.id,
            jobFileID: jobFile.id,
            currentLineNumber: 1,
          })
          const action = despoolTask(task, Set())

          const nextJob = MockJob()
          const nextJobFile = MockJobFile({
            jobID: job.id,
          })

          const stateWithAutomaticNextJob = state
            .set('automaticPrinting', true)
            .setIn(['jobs', nextJob.id], nextJob)
            .setIn(['jobFiles', nextJobFile.id], nextJobFile)
            .set('history', List([{
              type: START_PRINT,
              jobFileID: jobFile.id,
            }]))

          const [
            nextState,
            { actionToDispatch: nextAction },
          ] = jobQueueReducer(stateWithAutomaticNextJob, action)

          const finishEvent = nextState.history.last()

          expect(nextState.history.size).toEqual(2)
          expect(finishEvent.jobID).toEqual(job.id)
          expect(finishEvent.jobFileID).toEqual(jobFile.id)
          expect(finishEvent.taskID).toEqual(task.id)
          expect(finishEvent.type).toEqual(FINISH_PRINT)

          expect(nextAction).toEqual(
            requestSpoolJobFile({
              jobFileID: nextJobFile.id,
            }),
          )
        })
      })
      it('records START_PRINT and FINISH_PRINT if the print is 1 line long', () => {
        const task = MockTask({
          jobID: job.id,
          jobFileID: jobFile.id,
          currentLineNumber: 0,
          data: ['g1 x10 f3000'],
        })
        const action = despoolTask(task, Set())

        const results = jobQueueReducer(state, action)

        const nextState = getModel(results)

        const startEvent = nextState.history.first()
        const finishEvent = nextState.history.last()

        expect(nextState.history.size).toEqual(2)
        expect(startEvent.type).toEqual(START_PRINT)
        expect(finishEvent.type).toEqual(FINISH_PRINT)
      })
    })
  })
})
