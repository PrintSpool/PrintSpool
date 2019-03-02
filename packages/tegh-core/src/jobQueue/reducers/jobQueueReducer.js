import { Record, Map, List } from 'immutable'
import { loop, Cmd } from 'redux-loop'

import createTmpFiles from '../sideEffects/createTmpFiles'
import unlinkTmpFiles from '../sideEffects/unlinkTmpFiles'

import JobHistoryEvent from '../types/JobHistoryEvent'

import {
  SPOOL_PRINT,
  START_PRINT,
  CANCEL_PRINT,
  PRINT_ERROR,
  FINISH_PRINT,
} from '../types/JobHistoryTypeEnum'

import getPluginModels from '../../config/selectors/getPluginModels'

import getJobTmpFiles from '../selectors/getJobTmpFiles'
import getSpooledJobFiles from '../selectors/getSpooledJobFiles'
import getCompletedJobs from '../selectors/getCompletedJobs'
import getTaskIDByJobFileID from '../selectors/getTaskIDByJobFileID'
import getJobFilesByJobID from '../selectors/getJobFilesByJobID'

/* config actions */
import { SET_CONFIG } from '../../config/actions/setConfig'

import { REQUEST_CREATE_JOB } from '../actions/requestCreateJob'
import createJob, { CREATE_JOB } from '../actions/createJob'
import deleteJob, { DELETE_JOB } from '../actions/deleteJob'

import { SPOOL_TASK } from '../../spool/actions/spoolTask'
import { DESPOOL_TASK } from '../../spool/actions/despoolTask'
import { CANCEL_TASK } from '../../spool/actions/cancelTask'
import spoolJobFile from '../../spool/actions/spoolJobFile'

import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'

/* reducer */

export const initialState = Record({
  automaticPrinting: false,
  jobs: Map(),
  jobFiles: Map(),
  /*
   * A list of JobFileHistory records which can be reduced to determine the
   * current status of any job or jobFile in the queue.
   */
  history: List(),
})()

const jobQueueReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const { automaticPrinting } = getPluginModels(config).get('@tegh/core')
      return state.set('automaticPrinting', automaticPrinting)
    }
    case REQUEST_CREATE_JOB: {
      return loop(
        state,
        Cmd.run(createTmpFiles, {
          args: [action.payload],
          successActionCreator: createJob,
        }),
      )
    }
    case CREATE_JOB: {
      const { job, jobFiles } = action.payload

      const nextState = state
        .setIn(['jobs', job.id], job)
        .mergeIn(['jobFiles'], jobFiles)

      if (
        state.automaticPrinting
        && getSpooledJobFiles(state).size === 0
        && jobFiles.size > 0
      ) {
        const nextAction = spoolJobFile({ jobFileID: jobFiles.first().id })
        return loop(nextState, Cmd.action(nextAction))
      }

      return nextState
    }
    case DELETE_JOB: {
      const { jobID } = action.payload

      const tmpFilePaths = getJobTmpFiles(state)({ jobID }).toArray()

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
        Cmd.run(unlinkTmpFiles, { args: [tmpFilePaths] }),
      )
    }
    case PRINTER_READY:
    case ESTOP:
    case DRIVER_ERROR: {
      const isCancelledByUser = action.type === ESTOP
      const eventType = isCancelledByUser ? CANCEL_PRINT : PRINT_ERROR

      const taskIDs = getTaskIDByJobFileID(state)

      /* error or cancel any printing job file */
      const events = getSpooledJobFiles(state).map(jobFile => (
        JobHistoryEvent({
          jobID: jobFile.jobID,
          jobFileID: jobFile.id,
          taskID: taskIDs.get(jobFile.id),
          type: eventType,
        })
      ))
      return state.update('history', history => history.concat(events))
    }
    case CANCEL_TASK: {
      const { taskID } = action.payload
      const jobFileID = getTaskIDByJobFileID(state).findKey(v => v === taskID)

      if (jobFileID == null) return state

      const { jobID } = state.jobFiles.get(jobFileID)

      const historyEvent = JobHistoryEvent({
        jobID,
        jobFileID,
        taskID,
        type: CANCEL_PRINT,
      })

      /* mark each spooled job file as cancelled */
      return state.update('history', history => history.push(historyEvent))
    }
    case SPOOL_TASK: {
      const {
        jobID,
        jobFileID,
        id: taskID,
      } = action.payload.task

      if (jobID == null) return state

      /*
       * record the spooling of the print in the job history
       */
      const historyEvent = JobHistoryEvent({
        jobID,
        jobFileID,
        taskID,
        type: SPOOL_PRINT,
      })

      const nextState = state
        .update('history', history => history.push(historyEvent))

      /*
       * delete the previous job upon spooling a subsequent job
       */
      const jobsForDeletion = getCompletedJobs(state).toList()

      if (jobsForDeletion.size > 1) {
        throw new Error('only one completed Job should exist at a time')
      }

      if (jobsForDeletion.size === 1) {
        const nextAction = deleteJob({ jobID: jobsForDeletion.get(0).id })

        return loop(nextState, Cmd.action(nextAction))
      }

      return nextState
    }
    case DESPOOL_TASK: {
      const {
        id: taskID,
        jobID,
        jobFileID,
        currentLineNumber,
        data,
      } = action.payload.task

      if (jobID == null) return state

      const eventTypes = []

      const jobIsDone = currentLineNumber === data.size - 1

      if (currentLineNumber === 0) eventTypes.push(START_PRINT)
      if (jobIsDone) eventTypes.push(FINISH_PRINT)

      if (eventTypes.length === 0) return state

      /*
       * record the start or finish of the print in the job history
       */
      const historyEvents = eventTypes.map(eventType => (
        JobHistoryEvent({
          jobID,
          jobFileID,
          taskID,
          type: eventType,
        })
      ))

      const nextState = state
        .update('history', history => history.concat(historyEvents))

      if (jobIsDone && state.automaticPrinting) {
        const nextJob = state.jobs.first()
        const nextJobFile = getJobFilesByJobID(state).get((nextJob || {}).id)

        if (nextJobFile != null) {
          const nextAction = spoolJobFile({ jobFileID: nextJobFile.id })
          return loop(nextState, Cmd.action(nextAction))
        }
      }

      return nextState
    }
    default: {
      return state
    }
  }
}

export default jobQueueReducer
