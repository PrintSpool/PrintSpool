import { effects } from 'redux-saga'
const { takeEach, select, put } = effects

import fs from '../../util/promisifiedFS'
import { SPOOL } from '../../actions/spoolTask'
import { getJobsByStatus } from '../selectors/jobSelectors'
import getJobTmpFiles from '../selectors/getJobTmpFiles'
import deleteJob from '../actions/deleteJob'

const jobDeletionSaga = function*() {
  const spoolJobFilter = action => {
    return action.type === SPOOL && action.jobID != null
  }

  yield takeEach(spoolJobFilter, function*() {
    /* get all completed, errored or cancelled jobs */
    const jobsForDeletion = ( yield select( getJobsByStatus ) )({
      statuses: ['errored', 'cancelled', 'done']
    })

    for (const job of jobsForDeletion) {
      /* delete the job */
      yield put(deleteJob({ jobID: job.id }))
      /* unlink any tmp files associated with the job */
      const tmpPaths = ( yield select(getJobTmpFilePaths) )({ jobID: job.id})
      for (const tmpFilePath of tmpPaths) {
        await fs.unlinkAsync(tmpFilePath)
      }
    }
  })
}

export default jobDeletionSaga
