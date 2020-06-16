import { Record, Map, List } from 'immutable'
import { loop, Cmd } from 'redux-loop'
import Debug from 'debug'

import createTmpFiles from '../sideEffects/createTmpFiles'
import unlinkTmpFiles from '../sideEffects/unlinkTmpFiles'

import JobHistoryEvent from '../types/JobHistoryEvent'

import {
  indexedTaskStatuses,
  taskFailureStatuses,
  endedTaskStatuses,
  spooledTaskStatuses,
  // CANCELLED,
  // PAUSE_TASK,
  ERROR,
  START_TASK,
  FINISH_TASK,
  SPOOLED_TASK,
} from '../types/TaskStatusEnum'
import Task from '../types/Task'

import {
  ERRORED,
} from '../../printer/types/statusEnum'

import getPluginModels from '../../config/selectors/getPluginModels'

import getJobTmpFiles from '../selectors/getJobTmpFiles'
import getSpooledJobFiles from '../selectors/getSpooledJobFiles'
import getCompletedJobs from '../selectors/getCompletedJobs'
// import getTaskIDByJobFileID from '../selectors/getTaskIDByJobFileID'
import getNextJobFile from '../selectors/getNextJobFile'
// import getJobFilesByJobID from '../selectors/getJobFilesByJobID'

/* config actions */
import { SET_CONFIG } from '../../config/actions/setConfig'

import loadTaskFile from '../sideEffects/loadTaskFile'

import { REQUEST_CREATE_JOB } from '../actions/requestCreateJob'
import createJob, { CREATE_JOB } from '../actions/createJob'
import deleteJob, { DELETE_JOB } from '../actions/deleteJob'
import { SET_JOB_POSITION } from '../actions/setJobPosition'
import jobQueueComplete from '../actions/jobQueueComplete'

import spoolTask, { SPOOL_TASK } from '../actions/spoolTask'
import requestSpoolJobFile, { REQUEST_SPOOL_JOB_FILE } from '../actions/requestSpoolJobFile'
import { REQUEST_SPOOL_NEXT_JOB_FILE } from '../actions/requestSpoolNextJobFile'
import sendTaskToSocket, { SEND_TASK_TO_SOCKET } from '../../printer/actions/sendTaskToSocket'
import sendDeleteTaskHistoryToSocket from '../../printer/actions/sendDeleteTaskHistoryToSocket'

import { SOCKET_MESSAGE } from '../../printer/actions/socketMessage'
import requestEStop from '../../printer/actions/requestEStop'
import busyMachines, { NOT_BUSY } from '../selectors/busyMachines'

const debug = Debug('teg:jobQueue')

/* reducer */

export const initialState = Record({
  localID: null,
  automaticPrinting: false,
  jobs: Map(),
  jobFiles: Map(),
  tasks: Map(),
  taskIDOrder: List(),
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
      // TODO: multimachine job queue will need per machine automatic printing configs
      const model = getPluginModels(config.printer).get('@tegapp/core')
      return state
        .set('localID', config.host.localID)
        .set('automaticPrinting', model.get('automaticPrinting'))
    }
    case REQUEST_CREATE_JOB: {
      debug('request create job')
      // TODO: parse the job file macros into gcodes and save the associated actions here

      return loop(
        state,
        Cmd.run(createTmpFiles, {
          args: [action.payload],
          successActionCreator: createJob,
        }),
      )
    }
    case CREATE_JOB: {
      const { onCreate, jobFiles } = action.payload

      const lastJob = state.jobs.maxBy(job => job.position)

      let { job } = action.payload
      job = job.set('position', lastJob == null ? 0 : lastJob.position + 1)

      const nextState = state
        .setIn(['jobs', job.id], job)
        .mergeIn(['jobFiles'], jobFiles)

      const runCallback = Cmd.run(onCreate, { args: [job] })

      if (
        state.automaticPrinting
        && getSpooledJobFiles(state).size === 0
        && jobFiles.size > 0
      ) {
        debug(`creating and spooling Job #${job.id}: ${job.name}`)

        const nextAction = requestSpoolJobFile({
          jobFileID: getNextJobFile(nextState).id,
        })

        return loop(nextState, Cmd.list([
          Cmd.action(nextAction),
          runCallback,
        ]))
      }

      debug(`creating Job #${job.id}: ${job.name}`)

      return loop(nextState, runCallback)
    }
    case SET_JOB_POSITION: {
      const { jobID, position } = action.payload

      const nextJobs = state.jobs.map((job) => {
        if (job.id === jobID) {
          return job.set('position', position)
        }
        if (job.position >= position) {
          return job.set('position', job.position + 1)
        }
        return job
      })

      return state.set('jobs', nextJobs)
    }
    case DELETE_JOB: {
      const { jobID } = action.payload

      const tmpFilePaths = getJobTmpFiles(state)({ jobID }).toArray()

      const nextEffects = [
        Cmd.run(unlinkTmpFiles, { args: [tmpFilePaths] }),
      ]

      const nextState = state
        .deleteIn(['jobs', jobID])
        .update('jobFiles', jobFiles => (
          jobFiles.filter(file => file.jobID !== jobID)
        ))
        .update('history', history => (
          history.filter(historyEvent => historyEvent.jobID !== jobID)
        ))
        .update('tasks', tasks => (
          tasks.filter((task) => {
            if (
              task.jobID === jobID
              && spooledTaskStatuses.includes(task.status)
            ) {
              nextEffects.push(
                Cmd.action(requestEStop({ machineID: task.machineID })),
              )
            }

            return task.jobID !== jobID
          })
        ))

      return loop(
        nextState,
        Cmd.list(nextEffects),
      )
    }
    case SOCKET_MESSAGE: {
      /* eslint-disable no-param-reassign */
      const { machineID, newConnection } = action.payload
      const { feedback = {} } = action.payload.message
      const { events = [] } = feedback

      let currentTask = state.tasks.find(t => (
        // console.log('task?', t.status, t.machineID === machineID, t.status === START_TASK) ||
        t.machineID === machineID
        && t.status === START_TASK
      ))
      // console.log({currentTask, machineID, tasks: state.tasks.toJS()})

      let nextState = state
      const nextEffects = []

      /* task history */
      const newHistoryEvents = events
        .map((ev) => {
          ev.type = indexedTaskStatuses[ev.type]
          ev.id = `${ev.taskId}-${ev.type}`
          ev.task = state.tasks.get(ev.taskId)
          // console.log(ev.taskId)
          return ev
        })
        .filter(({ id, task }) => (
          task != null
          && !state.history.some(historyEvent => historyEvent.id === id)
        ))
        .map(({
          id,
          type,
          task,
          createdAt,
        }) => {
          nextState = nextState.setIn(
            ['tasks', task.id, 'status'],
            type,
          )
          return JobHistoryEvent({
            id,
            jobID: task.jobID,
            jobFileID: task.jobFileID,
            machineID,
            taskID: task.id,
            type,
            createdAt: new Date(createdAt * 1000).toISOString(),
          })
        })

      let isMidTask = (
        currentTask != null
        && newHistoryEvents.every(ev => {
          ev.taskID !== currentTask.id
          && endedTaskStatuses.includes(ev.type) === false
        })
      )

      // if the current task is missing it means the machine service may have
      // crashed and the task should be marked as errored.
      //
      // Also if the status is errored and there is no error event
      // then the task should be marked as errored anyways.
      if (
        isMidTask
        && (newConnection || feedback.status === ERRORED)
      ) {
        newHistoryEvents.push(
          JobHistoryEvent({
            id: `${currentTask.taskId}-${ERROR}`,
            jobID: currentTask.jobID,
            jobFileID: currentTask.jobFileID,
            machineID,
            taskID: currentTask.id,
            type: ERROR,
            createdAt: new Date().toISOString(),
          }),
        )
      }

      nextState = nextState
        .update('history', history => history.concat(newHistoryEvents))

      const finishedTask = (
        currentTask != null
        && newHistoryEvents.some(ev => (
          ev.taskId === currentTask.id
          && ev.type === FINISH_TASK
        ))
      )
      // console.log({currentTask: currentTask&&currentTask.toJS(), finishedTask, events})
      // console.log({tasks: state.tasks.toJS(), finishedTask, events})

      /* task annotations + line number updates */

      let { despooledLineNumber } = feedback
      if (finishedTask) {
        despooledLineNumber = currentTask.totalLines - 1
      }

      const hasDespooledLines = (
        currentTask != null
        && despooledLineNumber != null
        && despooledLineNumber > currentTask.currentLineNumber
      )

      if (hasDespooledLines) {
        // reload the task from the next state
        currentTask = nextState.tasks.get(currentTask.id)
          .set('previousLineNumber', currentTask.currentLineNumber)
          .set('currentLineNumber', despooledLineNumber)

        // add the actions annotated for this line number to the effects and
        // remove them from the annotations so they don't get executed again.
        currentTask = currentTask.updateIn(['annotations'], annotations => (
          annotations.filter((ann) => {
            const shouldExecAction = ann.lineNumber <= despooledLineNumber
            if (shouldExecAction) {
              nextEffects.push(Cmd.action(ann.action))
            }
            return !shouldExecAction
          })
        ))

        nextState = nextState.setIn(['tasks', currentTask.id], currentTask)
      }

      /* task cleanup */
      const finishedTaskIDs = events
        .filter(ev => (
          ev.type === FINISH_TASK
          && ev.clientId === state.localID
        ))
        .map(ev => ev.taskId)

      finishedTaskIDs.forEach((id) => {
        const task = state.tasks.get(id)
        if (task == null) {
          return
        }
        task.onComplete && task.onComplete()

        nextState = nextState.deleteIn(['tasks', task.id])
      })

      if (finishedTaskIDs.length > 0) {
        const deleteTaskHistory = sendDeleteTaskHistoryToSocket({
          machineID,
          taskIDs: finishedTaskIDs,
        })
        nextEffects.push(Cmd.action(deleteTaskHistory))
      }

      // console.log(finishedTask)
      /* next task */
      if (finishedTask) {
        // TODO: multimachine change: this would need to be changed to find
        // the next task for this particular machine
        const nextTaskID = nextState.taskIDOrder.first()

        if (nextTaskID != null) {
          // if a task exists send it to the machine
          nextState = nextState.update('taskIDOrder', list => list.shift())

          nextEffects.push(
            Cmd.action(sendTaskToSocket(nextState.tasks.get(nextTaskID))),
          )
        } else {
          // if no tasks exist and automatic printing is enabled then spool
          // the next job file
          const nextJobFile = getNextJobFile(nextState)

          // Automatic printing: start the next job after the current job finishes
          if (state.automaticPrinting && nextJobFile != null) {
            const nextAction = requestSpoolJobFile({
              jobFileID: nextJobFile.id,
              machineID,
            })
            nextEffects.push(
              Cmd.action(nextAction),
            )
          }

          if (nextJobFile == null) {
            // TODO: this should be renamed jobQueueExhausted.
            // Jobs may still be in progress in the multi-machine model
            nextEffects.push(
              Cmd.action(jobQueueComplete()),
            )
          }
        }
      }

      // failed tasks
      newHistoryEvents.forEach((event) => {
        const task = nextState.tasks.get(event.taskID)

        if (taskFailureStatuses.includes(event.type) && task.onError != null) {
          nextState = nextState.setIn(['tasks', task.id, 'status'], ERROR)

          nextEffects.push(
            Cmd.run(task.onError, {
              args: [task],
            }),
          )
        }
      })

      return loop(nextState, Cmd.list(nextEffects))
    }
    case REQUEST_SPOOL_NEXT_JOB_FILE: {
      // TODO: fix REQUEST_SPOOL_NEXT_JOB_FILE
      throw new Error('THIS IS BROKEN')
      // const jobID = state.getIn(['jobs', 0, 'id'])
      // if (jobID == null) {
      //   return state
      // }
      //
      // const jobFileID = getJobFilesByJobID(state).getIn([jobID, 0, 'id'])
      //
      // if (jobFileID == null) {
      //   return state
      // }
      //
      // return loop(
      //   state,
      //   Cmd.action(requestSpoolJobFile({ jobFileID })),
      // )
    }
    case REQUEST_SPOOL_JOB_FILE: {
      const { jobFileID, machineID } = action.payload
      const jobFile = state.jobFiles.get(jobFileID)

      if (jobFile == null) {
        throw new Error(`jobFile (id: ${jobFileID}) does not exist`)
      }

      const {
        jobID,
        name,
        filePath,
        totalLines,
        annotations,
      } = jobFile

      const task = Task({
        machineID,
        jobFileID: jobFile.id,
        jobID,
        name,
        filePath,
        totalLines,
        annotations,
      })

      return loop(
        state,
        Cmd.run(loadTaskFile, {
          args: [task],
          successActionCreator: spoolTask,
        }),
      )
    }
    case SPOOL_TASK: {
      const { task } = action.payload
      const {
        jobID,
        jobFileID,
        id: taskID,
        machineID,
      } = task

      /*
       * record the spooling of the print in the job history
       */
      const historyEvent = JobHistoryEvent({
        jobID,
        jobFileID,
        taskID,
        machineID,
        type: SPOOLED_TASK,
      })

      let nextState = state
        .setIn(['tasks', taskID], task)
        .update('history', history => history.push(historyEvent))

      if (busyMachines(state)[machineID] === NOT_BUSY) {
        return loop(nextState, Cmd.action(sendTaskToSocket(task)))
      }

      nextState = nextState.updateIn(['taskIDOrder'], list => list.push(task.id))

      return nextState
    }
    case SEND_TASK_TO_SOCKET: {
      const { task } = action.payload
      const {
        jobID,
        jobFileID,
        id: taskID,
        machineID,
      } = task

      /*
       * record the start of the print in the job history
       */
      const historyEvent = JobHistoryEvent({
        id: `${taskID}-${START_TASK}`,
        jobID,
        jobFileID,
        taskID,
        machineID,
        type: START_TASK,
      })

      const nextState = state
        .setIn(['tasks', taskID, 'status'], START_TASK)
        .update('history', history => history.push(historyEvent))

      if (task.jobID != null) {
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
      }

      return nextState
    }
    default: {
      return state
    }
  }
}

export default jobQueueReducer
