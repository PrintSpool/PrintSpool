import { Record, Map, List } from 'immutable'
import { loop, Cmd } from 'redux-loop'

import unlinkTmpFiles from '../sideEffects/unlinkTmpFiles'

import JobHistoryEvent from '../types/JobHistoryEvent'

import {
  SPOOL_PRINT,
  START_PRINT,
  CANCEL_PRINT,
  PRINT_ERROR,
  FINISH_PRINT,
} from '../types/JobHistoryTypeEnum'


import getJobTmpFiles from '../selectors/getJobTmpFiles'
import getSpooledJobFiles from '../selectors/getSpooledJobFiles'
import getCompletedJobs from '../selectors/getCompletedJobs'

import { CREATE_JOB } from '../actions/createJob'
import { CANCEL_JOB } from '../actions/cancelJob'
import deleteJob, { DELETE_JOB } from '../actions/deleteJob'

import { CANCEL_ALL_TASKS } from '../../spool/actions/cancelAllTasks'
import { SPOOL_TASK } from '../../spool/actions/spoolTask'
import { DESPOOL_TASK } from '../../spool/actions/despoolTask'

import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'

/* reducer */

export const initialState = Record({
  jobs: Map(),
  jobFiles: Map(),
  /*
   * A list of JobFileHistory records which can be reduced to determine the
   * current status of any job or jobFile in the queue.
   */
  history: List(),
})()

const jobQueue = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_JOB: {
      const { job, jobFiles } = action.payload

      return state
        .setIn(['jobs', job.id], job)
        .mergeIn(['jobFiles'], jobFiles)
    }
    case DELETE_JOB: {
      const { jobID } = action.payload

      const tmpFilePaths = getJobTmpFiles(state)({ jobID })

      const nextState = state
        .deleteIn(['jobs', jobID])
        .updateIn(['jobFiles'], jobFiles => (
          jobFiles.filter(file => file.jobID !== jobID)
        ))
        .updateIn(['history'], history => (
          history.filter(historyEvent => historyEvent.jobID !== jobID)
        ))

      return loop(
        nextState,
        Cmd.run(unlinkTmpFiles, tmpFilePaths),
      )
    }
    case PRINTER_READY:
    case ESTOP:
    case DRIVER_ERROR:
    case CANCEL_ALL_TASKS: {
      const isCancel = action.type === CANCEL_ALL_TASKS
      const eventType = isCancel ? CANCEL_PRINT : PRINT_ERROR

      /* error or cancel any printing job file */
      const events = getSpooledJobFiles(state).values().map(jobFile => (
        JobHistoryEvent({
          jobID: jobFile.jobID,
          jobFileID: jobFile.id,
          type: eventType,
        })
      ))

      return state.update('history', history => history.push(events))
    }
    case CANCEL_JOB: {
      const { jobID } = action.payload

      const spooledJobFiles = getSpooledJobFiles(state)
        .filter(jobFile => jobFile.jobID === jobID)

      /* error or cancel any printing job file */
      const events = spooledJobFiles.map(jobFile => (
        JobHistoryEvent({
          jobID: jobFile.jobID,
          jobFileID: jobFile.id,
          type: CANCEL_PRINT,
        })
      ))

      /* mark each spooled job file as cancelled */
      return state.update('history', history => history.push(events))
    }
    case SPOOL_TASK: {
      const {
        jobID,
        jobFileID,
      } = action.payload.task

      if (jobID == null) return state

      /*
       * record the spooling of the print in the job history
       */
      const historyEvent = JobHistoryEvent({
        jobID,
        jobFileID,
        type: SPOOL_PRINT,
      })

      const nextState = state
        .update('history', history => history.push(historyEvent))

      /*
       * delete the previous job upon spooling a subsequent job
       */
      const jobsForDeletion = getCompletedJobs(state)

      if (jobsForDeletion.length > 1) {
        throw new Error('only one completed Job should exist at a time')
      }

      if (jobsForDeletion.length === 1) {
        const nextAction = deleteJob({ jobID: jobsForDeletion[0].id })

        return loop(nextState, Cmd.action(nextAction))
      }

      return nextState
    }
    case DESPOOL_TASK: {
      const {
        jobID,
        jobFileID,
        currentLineNumber,
        data,
      } = action.payload.task

      if (jobID == null) return state

      const eventType = (() => {
        if (currentLineNumber === 0) return START_PRINT
        if (currentLineNumber === data.size - 1) return FINISH_PRINT
        return null
      })()

      if (eventType == null) return state

      /*
       * record the start or finish of the print in the job history
       */
      const historyEvent = JobHistoryEvent({
        jobID,
        jobFileID,
        type: eventType,
      })

      return state.update('history', history => history.push(historyEvent))
    }
    default: {
      return state
    }
  }
}

export default jobQueue
