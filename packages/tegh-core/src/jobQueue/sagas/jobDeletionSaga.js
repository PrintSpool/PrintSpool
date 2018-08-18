import { effects } from 'redux-saga'

import fs from '../../util/promisifiedFS'
import { SPOOL_TASK } from '../../spool/actions/spoolTask'
import { ERRORED, CANCELLED, DONE } from '../types/JobStatusEnum'
import getJobsByStatus from '../selectors/getJobsByStatus'
import getJobTmpFiles from '../selectors/getJobTmpFiles'
import deleteJob from '../actions/deleteJob'

/*
 * Deletes the previous job when the next job starts
 */
const jobDeletionSaga = function* () {
  const {
    takeLatest,
    select,
    put,
    cps,
  } = effects

  const spoolJobFilter = action => action.type === SPOOL_TASK && action.payload.task.jobID != null

  yield takeLatest(spoolJobFilter, function* () {
    /* get all completed, errored or cancelled jobs */
    const jobsByStatus = yield select(getJobsByStatus)
    const jobsForDeletion = jobsByStatus({
      statuses: [ERRORED, CANCELLED, DONE],
    })

    const state = yield select()
    // eslint-disable-next-line no-restricted-syntax
    for (const job of jobsForDeletion) {
      /* delete the job */
      yield deleteJob({ jobID: job.id })(put, () => state)
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const job of jobsForDeletion) {
      /* unlink any tmp files associated with the job */
      const jobTmpFiles = yield select(getJobTmpFiles)
      const tmpPaths = (jobTmpFiles)({ jobID: job.id })
      // eslint-disable-next-line no-restricted-syntax
      for (const tmpFilePath of tmpPaths) {
        yield cps(fs.unlink, tmpFilePath)
      }
    }
  })
}

export default jobDeletionSaga
