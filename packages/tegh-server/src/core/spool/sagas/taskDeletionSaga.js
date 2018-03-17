import { effects } from 'redux-saga'

import deleteTask, { DELETE_TASK } from '../actions/deleteTask'
import getTasksPendingDeletion from '../selectors/getTasksPendingDeletion'

const taskDeletionSaga = function*() {
  const { takeEvery, select, put } = effects
  const allActionsExceptDeletions = action => action.type != DELETE_TASK

  yield takeEvery(allActionsExceptDeletions, function*() {
    /* delete all the tasks pending deletion */
    const tasks = yield select(getTasksPendingDeletion)

    for (const task of tasks) {
      yield put(deleteTask({ id: task.id }))
    }
  })
}

export default taskDeletionSaga
