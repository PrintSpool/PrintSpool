import { effects } from 'redux-saga'
const { takeEach, select, put } = effects

import deleteTask, { DELETE_TASK } from '../actions/deleteTask'

const taskDeletionSaga = function*() {
  let previousTasks = null
  yield takeEach((action => action.type != DELETE_TASK), function*() {
    const tasks = yield select(state => state.spool.tasks)
    const tasksHaveChanged = tasks != previousTasks
    previousTasks = tasks
    if (tasksHaveChanged) {
      /* if the tasks have changed delete any tasks which do not belong to a job
       * and are either DONE, ERRORED or CANCELLED
       */
       const tasksForDeletion = tasks.filter(task => {
         return (
           task.jobID == null
           && [DONE, ERRORED, CANCELLED].include(task.status)
         )
       })
       for (const task of tasksForDeletion) {
         yield put(deleteTask({ id: task.id }))
       }
    }
  })
}

export default taskDeletionSaga
