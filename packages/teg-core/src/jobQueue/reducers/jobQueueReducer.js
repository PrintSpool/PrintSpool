import { Record, Map, List } from 'immutable'
import { loop, Cmd } from 'redux-loop'
import Debug from 'debug'

import createTmpFiles from '../sideEffects/createTmpFiles'
import unlinkTmpFiles from '../sideEffects/unlinkTmpFiles'
import loadJobFileInToTask from '../sideEffects/loadJobFileInToTask'

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
import getNextJobFile from '../selectors/getNextJobFile'
import getJobFilesByJobID from '../selectors/getJobFilesByJobID'

/* config actions */
import { SET_CONFIG } from '../../config/actions/setConfig'

import { REQUEST_CREATE_JOB } from '../actions/requestCreateJob'
import createJob, { CREATE_JOB } from '../actions/createJob'
import deleteJob, { DELETE_JOB } from '../actions/deleteJob'
import jobQueueComplete from '../actions/jobQueueComplete'

import spoolTask, { SPOOL_TASK } from '../../spool/actions/spoolTask'
import { DESPOOL_TASK } from '../../spool/actions/despoolTask'
import { DESPOOL_COMPLETED } from '../../spool/actions/despoolCompleted'
import { CANCEL_TASK } from '../../spool/actions/cancelTask'
import requestSpoolJobFile, { REQUEST_SPOOL_JOB_FILE } from '../../spool/actions/requestSpoolJobFile'
import { REQUEST_SPOOL_NEXT_JOB_FILE } from '../../spool/actions/requestSpoolNextJobFile'

import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'

const debug = Debug('tegh:jobQueue')

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
      const model = getPluginModels(config).get('@tegapp/core')
      return state.set('automaticPrinting', model.get('automaticPrinting'))
    }
    case REQUEST_CREATE_JOB: {
      debug('request create job')

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
        debug(`creating and spooling Job #${job.id}: ${job.name}`)

        const nextAction = requestSpoolJobFile({
          jobFileID: getNextJobFile(nextState).id,
        })

        return loop(nextState, Cmd.action(nextAction))
      }

      debug(`creating Job #${job.id}: ${job.name}`)

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
      const nextState = state
        .update('history', history => history.push(historyEvent))

      const nextJobFile = getNextJobFile(nextState)

      if (state.automaticPrinting && nextJobFile != null) {
        return loop(
          nextState,
          Cmd.action(requestSpoolJobFile({
            jobFileID: nextJobFile.id,
          })),
        )
      }

      if (nextJobFile == null) {
        return loop(nextState, Cmd.action(jobQueueComplete()))
      }

      return nextState
    }
    case REQUEST_SPOOL_NEXT_JOB_FILE: {
      const jobID = state.getIn(['jobs', 0, 'id'])
      if (jobID == null) {
        return state
      }

      const jobFileID = getJobFilesByJobID(state).getIn([jobID, 0, 'id'])

      if (jobFileID == null) {
        return state
      }

      return loop(
        state,
        Cmd.action(requestSpoolJobFile({ jobFileID })),
      )
    }
    case REQUEST_SPOOL_JOB_FILE: {
      const { jobFileID } = action.payload
      const jobFile = state.jobFiles.get(jobFileID)

      if (jobFile == null) {
        throw new Error(`jobFile (id: ${jobFileID}) does not exist`)
      }

      return loop(state, Cmd.run(loadJobFileInToTask, {
        args: [{ jobFile }],
        successActionCreator: spoolTask,
      }))
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
      } = action.payload.task

      if (jobID == null || currentLineNumber !== 0) {
        return state
      }

      /*
       * record the start of the print in the job history
       */
      const historyEvent = JobHistoryEvent({
        jobID,
        jobFileID,
        taskID,
        type: START_PRINT,
      })

      const nextState = state
        .update('history', history => history.push(historyEvent))

      return nextState
    }
    case DESPOOL_COMPLETED: {
      const { task, isLastLineInTask } = action.payload

      const {
        id: taskID,
        jobID,
        jobFileID,
      } = task

      if (jobID == null || !isLastLineInTask) {
        return state
      }

      /*
       * record the finish of the print in the job history
       */
      const historyEvent = JobHistoryEvent({
        jobID,
        jobFileID,
        taskID,
        type: FINISH_PRINT,
      })

      const nextState = state
        .update('history', history => history.push(historyEvent))


      const nextJobFile = getNextJobFile(nextState)

      if (state.automaticPrinting && nextJobFile != null) {
        return loop(
          nextState,
          Cmd.action(requestSpoolJobFile({
            jobFileID: nextJobFile.id,
          })),
        )
      }

      if (nextJobFile == null) {
        return loop(nextState, Cmd.action(jobQueueComplete()))
      }

      return nextState
    }
    default: {
      return state
    }
  }
}

export default jobQueueReducer
