import { effects } from 'redux-saga'

import deleteTasks, { DELETE_TASKS } from '../actions/deleteTasks'
import getTasksPendingDeletion from '../selectors/getTasksPendingDeletion'

const taskDeletionSaga = function*() {
  const { takeLatest, select, put } = effects
  const allActionsExceptDeletions = action => action.type != DELETE_TASKS

  yield takeLatest(allActionsExceptDeletions, function*() {
    /* delete all the tasks pending deletion */
    const tasks = yield select(getTasksPendingDeletion)

    yield put(deleteTasks({ ids: tasks.map(task => task.id) }))
  })
}

export default taskDeletionSaga
