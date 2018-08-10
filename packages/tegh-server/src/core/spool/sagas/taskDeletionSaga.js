import { effects } from 'redux-saga'

import deleteTasks, { DELETE_TASKS } from '../actions/deleteTasks'
import getTasksPendingDeletion from '../selectors/getTasksPendingDeletion'

const taskDeletionSaga = function* () {
  const { takeLatest, select, put } = effects

  yield takeLatest('*', function* (action) {
    if (action.type === DELETE_TASKS) return

    /* delete all the tasks pending deletion */
    const tasks = yield select(getTasksPendingDeletion)

    if (tasks.size === 0) return

    // throw new Error('TASKS EXIST' +
    // JSON.stringify(deleteTasks({ ids: tasks.map(task => task.id) })))
    yield put(deleteTasks({ ids: tasks.map(task => task.id) }))
  })
}

export default taskDeletionSaga
