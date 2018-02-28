import { effects } from 'redux-saga'
const { takeEach, select, put } = effects

import { SPOOL } from '../../actions/spoolTask'
import { getJobsByStatus } from '../selectors/jobSelectors'
import deleteJob from '../actions/deleteJob'

const jobDeletionSaga = function*() {
  const spoolJobFilter = action => {
    return action.type === SPOOL && action.jobID != null
  }

  yield takeEach(spoolJobFilter, function*() {
    /* delete any completed, errored or cancelled jobs on spool */
    const jobsForDeletion = ( yield select( getJobsByStatus() ) )({
      statuses: ['errored', 'cancelled', 'done']
    })
    for (job of jobsForDeletion) {
      yield put(deleteJob({ jobID: job.id }))
    }
  })
}

export default jobDeletionSaga
